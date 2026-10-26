/** Inline stroke icon over the shared Lucide-derived path set. */

import { ICON_PATHS } from '../rules/icons.ts'

export interface IconProps {
  /** Key of {@link ICON_PATHS}; unknown keys fall back to `default`. */
  readonly name: string
  readonly size?: number
}

/** One 24x24 stroke icon, currentColor, hidden from assistive traffic. */
export function Icon({ name, size = 18 }: IconProps) {
  const icon = ICON_PATHS[name] ?? ICON_PATHS.default
  return (
    <svg
      className="dshr-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icon.d.map((d, index) => <path key={index} d={d} />)}
    </svg>
  )
}
