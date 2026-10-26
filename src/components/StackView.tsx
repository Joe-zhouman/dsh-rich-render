/**
 * Stack: the explicit `stack` fence as vertically stacked layer rows. Boxes
 * in one layer share a row at equal heights; a box is a visual container
 * only — its Markdown renders as written (no label/title inference), the
 * fill only paints the background, and text color follows fill luminance.
 * No arrows between layers.
 */

import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { StackBoxSpec, StackSegment } from '../rules/segments.ts'
import { textOn } from '../rules/stack-colors.ts'
import { pathImages } from '../markdown-fallback.ts'

/** One box: fill + block Markdown body. */
function Box({ box, labels }: { box: StackBoxSpec; labels: MarkdownLabels }) {
  const style = box.fill === undefined ? undefined : { background: box.fill, color: textOn(box.fill) }
  return (
    <div className="dshr-stack-box" style={style}>
      {box.content === ''
        ? <span aria-hidden>&nbsp;</span>
        : <MarkdownText text={box.content} labels={labels} pathImages={pathImages} variant="compact" />}
    </div>
  )
}

export interface StackViewProps {
  readonly segment: StackSegment
  readonly labels: MarkdownLabels
}

/** Draw the layers. */
export function StackView({ segment, labels }: StackViewProps) {
  return (
    <div className="dshr-stack">
      {segment.layers.map((layer, index) => (
        <div key={index} className="dshr-stack-layer">
          {layer.boxes.map((box, boxIndex) => (
            <Box key={boxIndex} box={box} labels={labels} />
          ))}
        </div>
      ))}
    </div>
  )
}
