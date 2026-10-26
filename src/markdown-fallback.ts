/**
 * Markdown chrome this renderer reuses from the platform renderer's public
 * face: the label vocabulary MarkdownText consumes and the local-path image
 * resolver AssistantMarkdown builds (ui-chat's copy is not reachable from a
 * browser module-table package, so the resolver restates the same contract:
 * decode one authored destination once, then address it through the
 * authenticated file route when it is an absolute local path).
 */

import type { MarkdownFileMentions, MarkdownLabels, MarkdownPathImages } from '@deepseek-ai/dsh-client-ui-primitives'
import type { Translate } from './chat-contract.ts'

/** Absolute Windows-style drive path, mirroring util-workspace-path. */
function isWindowsStylePath(path: string): boolean {
  return /^[a-zA-Z]:[\\/]/u.test(path)
}

function isAbsoluteWorkspacePath(path: string): boolean {
  return path.startsWith('/') || isWindowsStylePath(path)
}

/**
 * Address a decoded absolute file path through the authenticated file route
 * (local restatement of @deepseek-ai/dsh-util-workspace-path fileMediaUrl).
 * @param base - HTTP(S) application base or `dsh-app://app/`.
 * @param path - Native file path; URL escapes already decoded.
 * @returns File URL, or undefined for unsupported transports and non-absolute paths.
 */
function fileMediaUrl(base: string, path: string): string | undefined {
  if ((!/^https?:/u.test(base) && !base.startsWith('dsh-app://app/')) || !isAbsoluteWorkspacePath(path)
    || /^[/\\]{2}/u.test(path) || /[\u0000-\u001f\u007f]/u.test(path)) return undefined
  return new URL(`api/file?path=${encodeURIComponent(path)}`, base).href
}

/**
 * Standalone fallback for image destinations (query/fragment suffixes are
 * ignored), mirroring ui-chat AssistantMarkdown.localPathMediaUrl.
 * @param base - canonical `document.baseURI` at render time.
 * @param value - authored Markdown destination; URL escapes are decoded once.
 * @returns an absolute Web or Desktop file-API URL, or undefined.
 */
export function localPathMediaUrl(base: string, value: string): string | undefined {
  let path: string
  try { path = decodeURIComponent(value.split(/[?#]/u)[0] ?? '') }
  catch { return undefined } // Malformed URL escapes cannot identify a file.
  return fileMediaUrl(base, path)
}

/**
 * Build the complete Markdown chrome copy for one locale revision.
 * @param t - this plugin's locale seat.
 * @returns Labels for code fences and footnotes.
 */
export function markdownLabels(t: Translate): MarkdownLabels {
  return {
    code: {
      copyLabel: t('copy'),
      copiedLabel: t('copied'),
      toolbarLabels: {
        codeLabel: t('codeBlockTitle'),
        wrapLabel: t('codeBlockWrap'),
        unwrapLabel: t('codeBlockUnwrap'),
      },
    },
    footnotes: t('footnotes'),
  }
}

/**
 * The path-image vocabulary this renderer always installs. One module-level
 * constant keeps the identity stable across renders, which MarkdownText's
 * memoization requires (a fresh object discards its streaming cache).
 */
export const pathImages: MarkdownPathImages = {
  resolve: value => localPathMediaUrl(document.baseURI, value),
}

/** Convenience alias documenting the mention vocabulary's provenance. */
export type Mentions = MarkdownFileMentions | undefined
