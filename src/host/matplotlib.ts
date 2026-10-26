/**
 * Cell execution with a content-addressed in-process cache. The key covers
 * code + backend + versions + DPI + font name; failures cache exactly like
 * successes — no retry path. Persistence beyond the host process is
 * deliberately absent: the deployment's sandboxed fs fences every
 * plugin-chosen cache location, and a restart re-running a cell once is
 * cheaper than a writable-root escape hatch.
 *
 * The program travels as a script FILE under the plugin's own `.cache/` dir,
 * not shell stdin: this deployment's sandboxed shell executor (pwsh-sandbox)
 * drops the stdin field. The host process writes the file unrestricted; the
 * confined python only needs to read it (the sandbox restricts writes, not
 * reads), and the script dir sits inside the sandbox's workspace root anyway.
 */

import { createHash } from 'node:crypto'
import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PythonVersions } from './persona.ts'
import { buildRunnerProgram } from './scripts.ts'

/** The shell face this runner needs (a subset of ctx.shell). */
export interface ShellFace {
  resolve(request: Record<string, unknown>): unknown
  execute(spec: unknown): Promise<{ result(): Promise<{
    exitCode: number | null
    signal: string | null
    timedOut: boolean
    aborted: boolean
    timeoutMs: number
    stdout: { text: string }
    stderr: { text: string }
  }> }>
}

/** One settled cell outcome. */
export type MatplotlibRunResult =
  | { readonly status: 'success'; readonly image: string }
  | { readonly status: 'error'; readonly message: string }

export { buildRunnerProgram }

/** Fixed execution parameters; every one participates in the cache key. */
const DPI = 100
const BACKEND = 'Agg'
const FONT = 'default'
/** Theme dimension of the cache key: theming is deferred, so one constant value. */
const THEME = 'default'
const TIMEOUT_MS = 60_000
const STDOUT_MAX = 8 * 1024 * 1024

/**
 * Parse one runner stdout.
 * @param output - runner stdout.
 * @param run - exit classification of the same run.
 * @returns the settled result (a crashed runner is an error result, never undefined).
 */
export function runResultFromOutput(output: string, run: { exitCode: number | null; stderr: string }): MatplotlibRunResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(output.trim().split('\n').at(-1) ?? '')
  } catch {
    parsed = undefined
  }
  if (typeof parsed === 'object' && parsed !== null) {
    const record = parsed as Record<string, unknown>
    if (record.status === 'success' && typeof record.image === 'string' && record.image !== '') {
      return { status: 'success', image: record.image }
    }
    if (record.status === 'error' && typeof record.message === 'string' && record.message !== '') {
      return { status: 'error', message: record.message }
    }
  }
  const detail = run.stderr.trim() !== '' ? run.stderr.trim() : `python exited with code ${String(run.exitCode)}`
  return { status: 'error', message: detail.slice(-2000) }
}

/** Runner dependencies. */
export interface RunnerDeps {
  readonly shell: ShellFace
  /** Configured python command/path. */
  readonly python: string
  /** Detected versions (the caller gates on them; they feed the cache key). */
  readonly versions: PythonVersions
  /** Existing directory the per-cell script files are written to. */
  readonly scriptDir: string
}

/** Executes cells; owns the in-memory cache and the script files. */
export class MatplotlibRunner {
  private readonly memory = new Map<string, MatplotlibRunResult>()
  private readonly deps: RunnerDeps

  constructor(deps: RunnerDeps) {
    this.deps = deps
  }

  private key(code: string): string {
    const { versions } = this.deps
    return createHash('sha256').update([
      code, BACKEND, THEME, versions.python, versions.matplotlib, versions.numpy, String(DPI), FONT,
    ].join('\0')).digest('hex')
  }

  /**
   * Run one cell (cache-first). The program file is content-addressed by the
   * same key as the result cache, so an existing file is reused as-is.
   * @param code - Python source from the fence.
   * @returns the settled outcome; never throws.
   */
  async run(code: string): Promise<MatplotlibRunResult> {
    const key = this.key(code)
    const cached = this.memory.get(key)
    if (cached !== undefined) return cached
    let result: MatplotlibRunResult
    try {
      const script = join(this.deps.scriptDir, `mpl-${key}.py`)
      if (!existsSync(script)) writeFileSync(script, buildRunnerProgram(code))
      const spec = this.deps.shell.resolve({
        command: `${this.deps.python} "${script.replaceAll('\\', '/')}"`,
        timeoutMs: TIMEOUT_MS,
        env: { MPLBACKEND: BACKEND },
        stdoutMaxBytes: STDOUT_MAX,
        // Read-only confinement: the cell has no writable path at all, which
        // is also stricter than the deployment default (see index.mjs).
        sandboxPolicy: { mode: 'read-only', workspaceRoot: this.deps.scriptDir.replaceAll('\\', '/') },
      })
      const execution = await this.deps.shell.execute(spec)
      const run = await execution.result()
      result = runResultFromOutput(run.stdout.text, { exitCode: run.exitCode, stderr: run.stderr.text })
    } catch (error) {
      result = { status: 'error', message: String(error).slice(0, 2000) }
    }
    this.memory.set(key, result)
    return result
  }
}
