/**
 * Python environment detection: parse the probe program's JSON. Detection is
 * host-startup-once (config-gated); environment changes need a restart.
 */

import type { PythonVersions } from './persona.ts'

export { DETECT_PROGRAM } from './scripts.ts'

/**
 * Parse the probe output (the run's exit code is the caller's gate).
 * @param output - stdout of the detect run.
 * @returns versions when python ran, exited 0, and both libs report versions; undefined otherwise.
 */
export function detectFromOutput(output: string): PythonVersions | undefined {
  let parsed: unknown
  try {
    parsed = JSON.parse(output.trim().split('\n').at(-1) ?? '')
  } catch {
    return undefined
  }
  if (typeof parsed !== 'object' || parsed === null) return undefined
  const record = parsed as Record<string, unknown>
  const pick = (key: string): string | undefined =>
    typeof record[key] === 'string' && record[key] !== '' ? record[key] as string : undefined
  const python = pick('python')
  const matplotlib = pick('matplotlib')
  const numpy = pick('numpy')
  if (python === undefined || matplotlib === undefined || numpy === undefined) return undefined
  return { python, matplotlib, numpy }
}
