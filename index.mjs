/**
 * Host half of dsh-rich-render: persona injection (merged environments
 * section always; a matplotlib section whenever enabled — its text stays
 * empty until the startup probe fills the detected versions) plus the
 * /rich-render RPC channel the browser half calls for matplotlib
 * status/execution. Rendering stays in src/client.ts.
 *
 * Sections filter subagents per assembly (header.origin); interpolate stays
 * off because persona text is prose that may legitimately contain braces.
 * Detection runs once at load — environment changes need a restart, matching
 * the MCP startup-check semantics. The matplotlib section registers
 * synchronously (an empty section assembles to nothing), so no registration
 * races the plugin fiber's disposal.
 */

import { join, dirname } from 'node:path'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import z from '@deepseek-ai/schemastery'
import { buildSections, isMainSession } from './src/host/persona.ts'
import { DETECT_PROGRAM, detectFromOutput } from './src/host/detect.ts'
import { MatplotlibRunner } from './src/host/matplotlib.ts'

export const name = 'dsh-rich-render'

export const inject = ['systemPrompt', 'shell', 'connection']

export const Config = z.object({
  matplotlib: z.object({
    enabled: z.boolean().default(false),
    python: z.string().default('python'),
  }).default({ enabled: false, python: 'python' }),
})

const SECTION_ORDER = 9000

/**
 * The python programs only read a script and print one JSON line, so they run
 * read-only-confined: no writable path at all. That is stricter than the
 * deployment's workspace-write default and, on this host, the only mode whose
 * ACL runner starts (workspace-write must re-ACL the workspace root, which is
 * not user-owned and refuses SetNamedSecurityInfoW).
 * @param scriptDir - the plugin's .cache dir; nominal root for the policy.
 */
function readOnlyPolicy(scriptDir) {
  return { mode: 'read-only', workspaceRoot: scriptDir.replaceAll('\\', '/') }
}

/**
 * @param ctx - plugin context (systemPrompt, shell, connection injected).
 * @param config - validated Config.
 */
export function apply(ctx, config = {}) {
  const matplotlibConfig = config.matplotlib ?? {}
  const python = matplotlibConfig.python ?? 'python'
  const enabled = matplotlibConfig.enabled ?? false

  const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  // Program files live in the plugin's own .cache dir: the host process
  // writes them unrestricted and the confined python only reads (the
  // sandboxed shell executor drops the stdin field, so stdin carriage is
  // not an option on this deployment).
  const scriptDir = join(packageRoot, '.cache')
  let markdown = ''
  try {
    mkdirSync(scriptDir, { recursive: true })
    markdown = readFileSync(join(packageRoot, 'persona.md'), 'utf8')
  } catch (error) {
    ctx.logger.warn(`rich-render: persona.md unreadable; prompt sections stay off (${String(error)})`)
  }
  const base = buildSections(markdown, undefined)

  let matplotlibText = ''
  let runner = undefined

  const register = (name, order, textFn) =>
    ctx.systemPrompt.section({ name, order, interpolate: false, text: textFn })

  if (markdown !== '') {
    register('rich-render:environments', SECTION_ORDER, assembleContext =>
      isMainSession(assembleContext?.agent?.session?.header?.origin) ? base.environments : '')
    if (enabled) {
      register('rich-render:matplotlib', SECTION_ORDER + 1, assembleContext =>
        isMainSession(assembleContext?.agent?.session?.header?.origin) ? matplotlibText : '')
    }
  }

  // Two exact Fetch routes on the shared /api channel (the file-upload
  // pattern): a dedicated channel needs webServer access this composition
  // does not grant, and the /api interceptor slot belongs to the API gateway
  // (one interceptor per channel). Exact routes ride the same Host/Origin
  // fence and browser auth as every /api request.
  const rpcRoute = (path, endpoint, logic) => ({
    path,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async request => {
      const failure = (code, message) => ({ ok: false, error: { code, message, details: {} } })
      let message
      try {
        message = await request.json()
      } catch {
        message = undefined
      }
      const rpcId = typeof message?.rpcId === 'string' && message.rpcId !== '' ? message.rpcId : 'invalid-request'
      const reply = result => Response.json({ type: 'server-response', rpcId, result })
      if (message?.type !== 'client-request' || message.method !== endpoint) {
        return reply(failure('bad-request', `rich-render: expected a ${endpoint} client-request`))
      }
      try {
        return reply(await logic(message.payload))
      } catch (error) {
        return reply(failure('internal', String(error).slice(0, 500)))
      }
    },
  })
  ctx.effect(() => ctx.connection.fetch.register(rpcRoute(
    '/api/rich-render/status',
    'rich-render/status',
    async () => ({ ok: true, value: { matplotlib: { enabled, ready: runner !== undefined } } }),
  )), 'rich-render: status route')
  ctx.effect(() => ctx.connection.fetch.register(rpcRoute(
    '/api/rich-render/exec',
    'rich-render/exec',
    async payload => {
      if (typeof payload?.code === 'string' && runner !== undefined) {
        return { ok: true, value: await runner.run(payload.code) }
      }
      return { ok: false, error: { code: 'unavailable', message: 'rich-render: matplotlib exec is not available', details: {} } }
    },
  )), 'rich-render: exec route')

  if (!enabled || markdown === '') return

  void (async () => {
    try {
      const detectScript = join(scriptDir, 'detect.py')
      writeFileSync(detectScript, DETECT_PROGRAM)
      const spec = ctx.shell.resolve({
        command: `${python} "${detectScript.replaceAll('\\', '/')}"`,
        timeoutMs: 30_000,
        sandboxPolicy: readOnlyPolicy(scriptDir),
      })
      const run = await (await ctx.shell.execute(spec)).result()
      if (run.exitCode !== 0) throw new Error(`detect exited ${String(run.exitCode)}: ${run.stderr.text.slice(0, 200)}`)
      const versions = detectFromOutput(run.stdout.text)
      if (versions === undefined) throw new Error('detect output missing matplotlib/numpy versions')
      runner = new MatplotlibRunner({ shell: ctx.shell, python, versions, scriptDir })
      matplotlibText = buildSections(markdown, versions).matplotlib ?? ''
      ctx.logger.info(`rich-render: matplotlib ready (python ${versions.python}, matplotlib ${versions.matplotlib}, numpy ${versions.numpy})`)
    } catch (error) {
      ctx.logger.warn(`rich-render: matplotlib disabled (${String(error)})`)
    }
  })()
}
