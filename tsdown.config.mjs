/**
 * Package-local tsdown config for the local rich-render bundle, following the
 * model-price-plugin pattern: the repository presets are workspace-only, so
 * this file restates the two artifact contracts.
 *
 * Two passes, one lib/ artifact directory:
 * 1. host — ESM lib/index.js from the no-op Host entry.
 * 2. client — CJS factory lib/client.js for the browser module loader. The
 *    banner/intro/footer are copied verbatim from packages/client/tsdown.client.ts
 *    so the artifact is executable by window.__ModuleLoader__.load. JSX compiles
 *    through the automatic runtime, so react/jsx-runtime arrives from the loader
 *    module table like every other platform module.
 *
 * Only module-table keys the bundle resolves through `require` stay external:
 * the shell baseline (react, react/jsx-runtime) plus the primitives package the
 * renderer reuses (MarkdownText, DisclosureRow, JsonBlock). Everything else —
 * the rule engine's micromark/mdast parser, local modules — is bundled, because
 * a require() the loader module table cannot answer is a guaranteed throw.
 */

/** Package name; the loader handoff id and the client config's filter name. */
const ID = 'dsh-local-rich-render'

/** Module-table specifiers this bundle imports at runtime and must not inline. */
const MODULE_TABLE_KEYS = [
  'react',
  'react/jsx-runtime',
  '@deepseek-ai/dsh-client-ui-primitives',
]

const isModuleTableKey = specifier => MODULE_TABLE_KEYS.includes(specifier)

/**
 * Host pass: the no-op Cordis plugin entry, loaded by the DSH Loader from a
 * real install, so its imports resolve through node_modules resolution.
 */
const host = {
  name: ID,
  entry: { index: 'index.mjs' },
  outDir: 'lib',
  format: 'esm',
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: true,
}

/**
 * Client pass: one browser factory over the TS/TSX sources. `clean` stays
 * false so the pass does not wipe the host half emitted above.
 */
const client = {
  name: `${ID}/client`,
  entry: { client: 'src/client.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: isModuleTableKey,
    alwaysBundle: specifier => !isModuleTableKey(specifier),
  },
  transform: {
    jsx: { runtime: 'automatic', importSource: 'react' },
  },
  outputOptions: {
    entryFileNames: 'client.js',
    chunkFileNames: 'client.[name].js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    footer: 'return module.exports; } });',
  },
}

export default [host, client]
