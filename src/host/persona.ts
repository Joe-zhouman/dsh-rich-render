/**
 * Persona assembly: split persona.md into the always-on merged section and
 * the conditional matplotlib template, substitute detected versions, and
 * decide per-assembly visibility (subagents get nothing).
 *
 * persona.md layout: an injection-notes preamble, then `---`, then the
 * `## 富渲染环境` body, then `---`, then the `## matplotlib 绘图环境` body.
 */

/** Detected interpreter/library versions for the matplotlib section. */
export interface PythonVersions {
  readonly python: string
  readonly matplotlib: string
  readonly numpy: string
}

/** The two prompt sections persona.md carries. */
export interface PersonaSections {
  /** Merged environments section; always registered for main sessions. */
  readonly environments: string
  /** Matplotlib section with versions substituted; absent when undetected. */
  readonly matplotlib: string | undefined
}

/**
 * Split and substitute persona.md.
 * @param markdown - persona.md contents.
 * @param versions - detected versions; undefined suppresses the matplotlib section.
 */
export function buildSections(markdown: string, versions: PythonVersions | undefined): PersonaSections {
  const parts = markdown.split(/^---\s*$/mu)
  const environments = (parts[1] ?? '').trim()
  const template = (parts[2] ?? '').trim()
  const substituted = versions === undefined || template === ''
    ? undefined
    : template
      .replaceAll('{python}', versions.python)
      .replaceAll('{matplotlib}', versions.matplotlib)
      .replaceAll('{numpy}', versions.numpy)
  return { environments, matplotlib: substituted }
}

/**
 * Whether one assembly should see rich-render sections.
 * @param origin - `assembleContext.agent?.session?.header?.origin`.
 * @returns true unless the assembly belongs to a subagent.
 */
export function isMainSession(origin: string | undefined): boolean {
  return origin !== 'subagent'
}
