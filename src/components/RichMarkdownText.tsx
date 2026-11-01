/**
 * One assistant text block through the upgrade pipeline.
 *
 * While the message streams the block renders exactly like the shipped
 * AssistantMarkdown path (platform MarkdownText with the streaming parser);
 * once settled, the rule engine segments the text and each upgraded segment
 * renders as its rich component inside a local error boundary — a component
 * failure degrades that segment to native markdown instead of crashing the
 * transcript (the slot's own abdication then covers a total failure).
 */

import { Component, memo } from 'react'
import type { ReactNode } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarkdownLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import { pathImages } from '../markdown-fallback.ts'
import type { Mentions } from '../markdown-fallback.ts'
import { rewritePathImages, upgradeText } from '../rules/segments.ts'
import type { CalloutType, UpgradeSegment } from '../rules/segments.ts'
import { CalloutView } from './CalloutView.tsx'
import { CardsView } from './CardsView.tsx'
import { ChecklistView } from './ChecklistView.tsx'
import { ChoicesView } from './ChoicesView.tsx'
import { ImageView } from './ImageView.tsx'
import { MatplotlibView } from './MatplotlibView.tsx'
import { MindmapView } from './MindmapView.tsx'
import { StackView } from './StackView.tsx'
import { TabView } from './TabView.tsx'
import { TableDualView } from './TableDualView.tsx'
import { TimelineView } from './TimelineView.tsx'
import { TreeView } from './TreeView.tsx'

/** Locale copy the upgraded components need, stable per locale revision. */
export interface RichChrome {
  readonly table: string
  readonly chart: string
  readonly downloadChart: string
  readonly otherSlice: string
  readonly checklistTitle: string
  readonly checklistProgress: string
  readonly mplCode: string
  readonly mplChart: string
  readonly mplDownload: string
  readonly mplRunning: string
  readonly mplFailed: string
  readonly mplDownloadPng: string
  /** Clipboard action labels shared by the image card and the chart toolbars. */
  readonly copy: string
  readonly copied: string
  readonly copyFailed: string
  /** Image-card degradation copy. */
  readonly imagePreviewFailed: string
  /** Alert titles keyed by GitHub alert flavor. */
  readonly calloutTitles: Readonly<Record<CalloutType, string>>
}

/** Render one segment spec; the error boundary below wraps the result. */
function SegmentView({ segment, labels, mentions, chrome }: {
  segment: UpgradeSegment
  labels: MarkdownLabels
  mentions: Mentions
  chrome: RichChrome
}): ReactNode {
  switch (segment.kind) {
    case 'native':
      return <MarkdownText text={segment.text} labels={labels} fileMentions={mentions} pathImages={pathImages} />
    case 'cards':
      return <CardsView segment={segment} labels={labels} />
    case 'callout':
      return <CalloutView segment={segment} labels={labels} titles={chrome.calloutTitles} />
    case 'table':
      return <TableDualView segment={segment} chartLabels={chrome} labels={labels} />
    case 'timeline':
      return <TimelineView segment={segment} labels={labels} />
    case 'mindmap':
      return <MindmapView segment={segment} labels={labels} />
    case 'checklist':
      return <ChecklistView segment={segment} labels={labels} chrome={chrome} />
    case 'tree':
      return <TreeView segment={segment} />
    case 'stack':
      return <StackView segment={segment} labels={labels} />
    case 'tab':
      return <TabView segment={segment} labels={labels} />
    case 'choices':
      return <ChoicesView segment={segment} labels={labels} mentions={mentions} chrome={chrome} />
    case 'matplotlib':
      return <MatplotlibView segment={segment} labels={labels} chrome={chrome} />
    case 'image':
      return <ImageView segment={segment} chrome={chrome} />
    default:
      // Unreachable today: upgradeText's union is closed; new kinds land
      // here and a missing case fails the golden-set regression.
      return <MarkdownText text={JSON.stringify(segment)} labels={labels} />
  }
}

/** Error boundary degrading the failing segment to native markdown. */
class SegmentBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }
  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export interface RichMarkdownTextProps {
  readonly text: string
  readonly streaming: boolean
  readonly labels: MarkdownLabels
  readonly mentions: Mentions
  /** Locale copy for the upgraded components (toggle, supplement slice). */
  readonly chrome: RichChrome
}

/** One text block: native while streaming, rule-upgraded once settled. */
export const RichMarkdownText = memo(function RichMarkdownText({ text, streaming, labels, mentions, chrome }: RichMarkdownTextProps) {
  if (streaming) {
    return <MarkdownText text={text} streaming labels={labels} />
  }
  let segments: UpgradeSegment[]
  try {
    // The image pass runs first on the whole text: paths become standard
    // images and body images split into their own paragraphs, so the walk
    // meets each image standalone and upgrades it to the framed card.
    segments = upgradeText(rewritePathImages(text))
  } catch {
    return <MarkdownText text={rewritePathImages(text)} labels={labels} fileMentions={mentions} pathImages={pathImages} />
  }
  if (segments.length === 1 && segments[0]?.kind === 'native') {
    return <MarkdownText text={segments[0].text} labels={labels} fileMentions={mentions} pathImages={pathImages} />
  }
  return (
    <>
      {segments.map((segment, index) => (
        <SegmentBoundary
          key={index}
          fallback={<MarkdownText text={segment.source} labels={labels} fileMentions={mentions} pathImages={pathImages} />}
        >
          <SegmentView segment={segment} labels={labels} mentions={mentions} chrome={chrome} />
        </SegmentBoundary>
      ))}
    </>
  )
})
