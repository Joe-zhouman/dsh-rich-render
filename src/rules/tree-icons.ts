/**
 * File/folder icon resolution for the tree fence, aligned with the Material
 * Icon Theme associations (curated inline copy: material-icons.generated.ts).
 * Special whole names first, then the basename, then the extension family,
 * then the generic document. Folder names resolve through the folder table
 * with an open variant per glyph.
 */

import {
  MATERIAL_FILE_DEFAULT, MATERIAL_FILE_EXTS, MATERIAL_FILE_NAMES, MATERIAL_FOLDER, MATERIAL_FOLDER_NAMES,
  MATERIAL_FOLDER_OPEN, MATERIAL_PATHS,
} from './material-icons.generated.ts'
import type { MaterialPath } from './material-icons.generated.ts'

/** One resolved icon: the material icon name plus its filled paths. */
export interface TreeIcon {
  readonly name: string
  readonly paths: readonly MaterialPath[]
}

const GENERIC: TreeIcon = { name: MATERIAL_FILE_DEFAULT, paths: MATERIAL_PATHS[MATERIAL_FILE_DEFAULT]! }
const FOLDER: TreeIcon = { name: MATERIAL_FOLDER, paths: MATERIAL_PATHS[MATERIAL_FOLDER]! }
const FOLDER_OPEN: TreeIcon = { name: MATERIAL_FOLDER_OPEN, paths: MATERIAL_PATHS[MATERIAL_FOLDER_OPEN]! }

function iconFor(name: string | undefined): TreeIcon | undefined {
  if (name === undefined) return undefined
  const paths = MATERIAL_PATHS[name]
  return paths === undefined ? undefined : { name, paths }
}

/**
 * @param name - file name (folders arrive only without their trailing slash).
 * @returns the material icon for the name; the generic document as fallback.
 */
export function fileIcon(name: string): TreeIcon {
  const lower = name.toLowerCase()
  const dot = lower.lastIndexOf('.')
  const ext = dot === -1 ? '' : lower.slice(dot + 1)
  const base = dot === -1 ? lower : lower.slice(0, dot)
  return iconFor(MATERIAL_FILE_NAMES[lower])
    ?? iconFor(MATERIAL_FILE_NAMES[base])
    ?? iconFor(MATERIAL_FILE_EXTS[ext])
    ?? GENERIC
}

/**
 * @param name - folder name without its trailing slash.
 * @param open - whether the folder is expanded (the open glyph variant).
 * @returns the material folder icon; the default folder pair as fallback.
 */
export function folderIcon(name: string, open: boolean): TreeIcon {
  const base = MATERIAL_FOLDER_NAMES[name.toLowerCase()]
  if (base === undefined) return open ? FOLDER_OPEN : FOLDER
  return iconFor(open ? `${base}-open` : base) ?? (open ? FOLDER_OPEN : FOLDER)
}
