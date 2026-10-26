/**
 * Minimal local typing for the client-plugin surface this package consumes.
 *
 * The browser Context and its slot/locale services arrive from the shell at
 * apply time; declaring the narrow face here keeps this out-of-tree package
 * hermetic (no type dependency on workspace sources it cannot install) while
 * still checking every call it makes. Shapes mirror the SlotRegistry and
 * LocaleRuntime contracts in packages/client/{ui-renderer,locale}.
 */

/** One slot registration as `ctx.slots.register` accepts it. */
export interface SlotRegistrationOptions {
  /** Declared SlotMap key the entry mounts under. */
  readonly name: string
  /** Keyed-slot cell this entry occupies. */
  readonly key?: string
  /** List-slot cell id; a fresh id adds an entry, a reused one replaces it. */
  readonly id?: string
  /** Declared locale namespace; synthesizes the `t` seat for the component. */
  readonly locale?: string
  /** List-slot ordering hint (ascending; registration order otherwise). */
  readonly order?: number
}

/** The `ctx.effect` face: register one disposer on the plugin fiber. */
export type EffectFn = (
  factory: () => (() => void) | void,
  name?: string,
) => () => void

/** The client Cordis context slice this plugin calls. */
export interface ClientCtx {
  readonly effect: EffectFn
  readonly slots: {
    /** Run one effect per declaration lifetime of the named slot. */
    inject(
      key: string,
      factory: () => (() => void) | Iterable<() => void>,
    ): () => void
    /** Register one component; the disposer unregisters it. */
    register(
      options: SlotRegistrationOptions,
      component: unknown,
    ): () => void
  }
  readonly locale: {
    /** Register one namespace's dictionaries; returns the disposer. */
    register(
      ns: string,
      dicts: Readonly<Record<string, Readonly<Record<string, string>>>>,
    ): () => void
  }
  /** Host RPC channel access (the matplotlib bridge); composed by the web shell. */
  readonly connection?: {
    readonly rpc: import('../matplotlib-bridge.ts').RpcFace
  }
}
