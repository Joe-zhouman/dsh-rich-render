/**
 * Browser-to-host bridge for the matplotlib fence. client.ts installs the
 * connection RPC face once at plugin load; views read it through here. Any
 * transport failure reads as "not ready", so the fence degrades to a plain
 * code block instead of an error card.
 */

/** One settled cell outcome (mirror of the host's result). */
export type MatplotlibRunResult =
  | { readonly status: 'success'; readonly image: string }
  | { readonly status: 'error'; readonly message: string }

/** The connection RPC face this bridge calls. */
export interface RpcFace {
  call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<
    { ok: true; value: unknown } | { ok: false; error: { code?: string; message: string; details?: object } }
  >
}

let rpc: RpcFace | undefined

/** Readiness fact the host reports. */
export interface MatplotlibStatus {
  readonly enabled: boolean
  readonly ready: boolean
}

/** Per-module memo: one probe per page load, reset when the RPC face changes. */
let statusPromise: Promise<MatplotlibStatus> | undefined

/**
 * Whether the matplotlib environment is live.
 * @returns enabled/ready; both false when the bridge or host is unreachable.
 */
function probeStatus(): Promise<MatplotlibStatus> {
  statusPromise ??= (async () => {
    if (rpc === undefined) return { enabled: false, ready: false }
    try {
      const result = await rpc.call('/api', 'rich-render/status', {})
      if (result.ok !== true) return { enabled: false, ready: false }
      const value = result.value as { matplotlib?: { enabled?: boolean; ready?: boolean } }
      return {
        enabled: value.matplotlib?.enabled === true,
        ready: value.matplotlib?.ready === true,
      }
    } catch {
      return { enabled: false, ready: false }
    }
  })()
  return statusPromise
}

/**
 * Install or clear the RPC face; a probe memoized against the previous face
 * must not stick, so the readiness cache resets with it.
 * @param face - the connection RPC face, or undefined on dispose.
 */
export function setMatplotlibRpc(face: RpcFace | undefined): void {
  rpc = face
  statusPromise = undefined
}

/** @returns the live readiness fact (memoized until the face changes). */
export function matplotlibStatus(): Promise<MatplotlibStatus> {
  return probeStatus()
}

/**
 * Execute one cell.
 * @param code - Python source from the fence.
 * @returns the settled outcome; transport failures surface as error results.
 */
export async function matplotlibExec(code: string): Promise<MatplotlibRunResult> {
  if (rpc === undefined) return { status: 'error', message: 'rich-render bridge unavailable' }
  try {
    const result = await rpc.call('/api', 'rich-render/exec', { code })
    if (result.ok === true) return result.value as MatplotlibRunResult
    return { status: 'error', message: result.error.message }
  } catch (error) {
    return { status: 'error', message: String(error) }
  }
}
