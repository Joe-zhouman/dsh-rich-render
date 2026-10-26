/**
 * Matplotlib host regression: version detection parsing, cache-key stability,
 * runner program assembly and JSON protocol parsing, failure caching. All IO
 * is injected as fakes; no real python runs here (the real shell path is the
 * live-verification gate).
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { detectFromOutput, DETECT_PROGRAM } from '../src/host/detect.ts'
import { buildRunnerProgram, MatplotlibRunner, runResultFromOutput } from '../src/host/matplotlib.ts'

/** A fresh script dir per runner, removed when the process exits. */
function makeScriptDir() {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-rich-render-test-'))
  process.on('exit', () => rmSync(dir, { recursive: true, force: true }))
  return dir
}

function fakeShell(output, { exit = 0, stderr = '' } = {}) {
  const calls = []
  return {
    calls,
    resolve: request => request,
    async execute(spec) {
      calls.push(spec)
      return { result: async () => ({ exitCode: exit, signal: null, timedOut: false, aborted: false, timeoutMs: spec.timeoutMs, stdout: { text: output, truncated: false }, stderr: { text: stderr, truncated: false } }) }
    },
  }
}

const VERSIONS = { python: '3.12.7', matplotlib: '3.11.2', numpy: '2.5.3' }

test('detect parses versions and tolerates missing libs', () => {
  assert.deepEqual(
    detectFromOutput('{"python": "3.12.7", "matplotlib": "3.11.2", "numpy": "2.5.3"}'),
    { python: '3.12.7', matplotlib: '3.11.2', numpy: '2.5.3' },
  )
  assert.equal(detectFromOutput('{"python": "3.12.7", "matplotlib": null, "numpy": "2.5.3"}'), undefined)
  assert.equal(detectFromOutput('garbage'), undefined)
  assert.ok(DETECT_PROGRAM.includes('find_spec'))
})

test('runner program embeds the code as JSON and pins seeds/Agg/scope', () => {
  const program = buildRunnerProgram('print(1)')
  assert.ok(program.includes(JSON.stringify(JSON.stringify({ code: 'print(1)' }))))
  assert.ok(program.includes('matplotlib.use("Agg")'))
  assert.ok(program.includes('seed(0)'))
  assert.ok(program.includes('"plt": plt'))
})

test('runner protocol: success carries base64 image; failure carries message', () => {
  const ok = runResultFromOutput('{"status":"success","image":"aGk="}', { exitCode: 0, stderr: '' })
  assert.equal(ok.status, 'success')
  assert.equal(ok.image, 'aGk=')

  const err = runResultFromOutput('{"status":"error","message":"boom"}', { exitCode: 0, stderr: '' })
  assert.equal(err.status, 'error')
  assert.equal(err.message, 'boom')

  const crashed = runResultFromOutput('', { exitCode: 1, stderr: 'ImportError' })
  assert.equal(crashed.status, 'error')
  assert.ok(crashed.message.includes('ImportError'))
})

test('same code hits the shell once; the program lands in the script dir; failures cache too', async () => {
  let runs = 0
  const shell = fakeShell('')
  shell.execute = async spec => {
    shell.calls.push(spec)
    runs++
    const output = runs === 1
      ? '{"status":"error","message":"first fails"}'
      : '{"status":"success","image":"QUJD"}'
    return { result: async () => ({ exitCode: 0, signal: null, timedOut: false, aborted: false, timeoutMs: 60000, stdout: { text: output, truncated: false }, stderr: { text: '', truncated: false } }) }
  }
  const scriptDir = makeScriptDir()
  const runner = new MatplotlibRunner({ shell, python: 'python', versions: VERSIONS, scriptDir })
  const first = await runner.run('print(1)')
  assert.equal(first.status, 'error')
  assert.ok(shell.calls[0].command.includes('.py'), 'the command executes a script file')
  assert.equal(shell.calls[0].sandboxPolicy.mode, 'read-only', 'the cell runs confined read-only')
  const written = shell.calls[0].command.match(/mpl-[0-9a-f]{64}\.py/)[0]
  assert.equal(readFileSync(join(scriptDir, written), 'utf8'), buildRunnerProgram('print(1)'))
  const second = await runner.run('print(1)')
  assert.equal(second, first)
  assert.equal(runs, 1)
  const third = await runner.run('print(2)')
  assert.equal(third.status, 'success')
  assert.equal(runs, 2)
})

test('shell throw becomes an error result, never a reject', async () => {
  const shell = fakeShell('')
  shell.execute = async () => { throw new Error('sandbox refused') }
  const runner = new MatplotlibRunner({ shell, python: 'python', versions: VERSIONS, scriptDir: makeScriptDir() })
  const result = await runner.run('code')
  assert.equal(result.status, 'error')
  assert.ok(result.message.includes('sandbox refused'))
})
