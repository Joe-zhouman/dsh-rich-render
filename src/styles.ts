/**
 * The plugin's entire stylesheet as one injected `<style>` text.
 *
 * Out-of-tree client bundles cannot use the repository's CSS Modules preset,
 * so styles live in this plain string under the reserved `dshr-` prefix and
 * ride the plugin's own lifecycle effect (see stylesheet.ts). Colors, radii,
 * and type sizes consume the app's `--dsw-alias-*` / `--dsh-*` tokens so both
 * themes keep working; only values with no platform token are spelled out.
 *
 * Sections in file order: flow shell (AssistantMarkdown replica), think row
 * (ReasoningRow replica), a11y helper, then the rich-upgrade components.
 */

export const STYLESHEET = `
/* ---- Flow shell: replica of ui-chat AssistantMarkdown.module.css ---- */
.dshr-flow-root {
  display: flex;
  flex-direction: column;
  font-size: var(--dsh-content-font-size, 14px);
  line-height: calc(24px + var(--dsh-content-font-delta, 0px));
  color: var(--dsw-alias-label-primary);
}

.dshr-flow-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Inline code in the rendered markdown: a tint of the text's own color, 4px
 * corners, no frame, and padding that keeps the pill on the text line
 * instead of the taller box the platform's inline-flex draws. Scoped to this
 * renderer, so tool blocks and the rest of the app keep the platform look.
 * The doubled container class outranks the platform's markdown rule, whose
 * specificity matches this one — without it, stylesheet order alone would
 * decide. */
.dshr-flow-body.dshr-flow-body :not(pre) > code {
  display: inline;
  padding: 1px 6px;
  border: 0;
  border-radius: 4px;
  background: color-mix(in srgb, currentColor 6%, transparent);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/* A dark surface already sits near the text tint, so the same 6% would read
 * darker than the platform pill there; 9% lands between the two. */
body[data-ds-dark-theme] .dshr-flow-body.dshr-flow-body :not(pre) > code {
  background: color-mix(in srgb, currentColor 9%, transparent);
}

/* Wide markdown tables span the transcript width instead of clipping at the
   message column (the renderer's >=4-column md-table-wide hook). */
.dshr-flow-body .md-table-wide {
  --dsh-table-spare: max(0px, calc((100cqw - var(--dsh-chat-content-width)) / 2));
  --dsh-table-lead: calc(var(--dsh-table-spare) + min(var(--dsh-chat-content-width), 100cqw) - 100%);
  box-sizing: border-box;
  width: calc(100% + var(--dsh-table-lead) + var(--dsh-table-spare));
  max-width: none;
  margin-left: calc(-1 * var(--dsh-table-lead));
  padding-left: var(--dsh-table-lead);
}

.dshr-flow-body .md-table-wide > table {
  position: relative;
  z-index: 1;
}

/* hidden="until-found" keeps a zero-height reasoning box in flex layout. */
.dshr-flow-body > [data-turn-process-inline][hidden] {
  margin-bottom: -16px;
}

.dshr-stopped {
  align-self: flex-start;
  padding: 0 6px;
  border-radius: var(--dsw-radius-sm);
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 18px;
}

/* ---- Think row: replica of ui-chat ReasoningRow.module.css ---- */
.dshr-think-root {
  display: flex;
  flex-direction: column;
}

.dshr-think-root:not([data-expanded]) {
  contain: size layout;
  height: calc(24px + var(--dsh-content-font-delta, 0px));
}

.dshr-think-row {
  position: relative;
  overflow: hidden;
}

.dshr-think-root[data-expanded] [data-open] [data-disclosure-row] {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--dsw-alias-bg-base);
}

.dshr-think-root[data-state='running'] .dshr-think-row::after {
  content: '';
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 300px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--dsw-alias-bg-base) 60%, transparent) 55%,
    transparent 100%
  );
  animation: dshr-think-sweep 2.6s ease-out infinite;
  pointer-events: none;
}

@keyframes dshr-think-sweep {
  0% { left: -300px; }
  90%, 100% { left: 100%; }
}

.dshr-think-leading {
  flex-shrink: 0;
}

.dshr-think-chevron {
  color: var(--dsw-alias-label-secondary);
}

.dshr-think-title {
  font-weight: 400;
}

.dshr-think-separator {
  flex: none;
  width: 2px;
  height: 2px;
  margin: 0 8px;
  border-radius: 1px;
  background: var(--dsw-alias-label-caption);
}

.dshr-think-summary {
  min-width: 0;
  overflow: hidden;
  flex: 1 1 auto;
  color: var(--dsw-alias-label-tertiary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
  white-space: nowrap;
}

.dshr-think-summary-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dshr-think-summary[data-streaming] {
  mask-image: linear-gradient(to right, black calc(100% - 48px), transparent);
}

.dshr-think-summary[data-streaming] .dshr-think-summary-text {
  overflow: visible;
  text-overflow: clip;
}

.dshr-think-root:not([data-preview]) .dshr-think-separator,
.dshr-think-root:not([data-preview]) .dshr-think-summary {
  display: none;
}

.dshr-think-body {
  padding: 4px 0 4px calc(22px + var(--dsh-content-font-delta, 0px));
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .dshr-think-root[data-state='running'] .dshr-think-row::after {
    animation: none;
  }
}

/* ---- A11y helper ---- */
.dshr-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* ---- Shared fence frame: one quiet outline around every explicit fence ---- */
.dshr-fence {
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
}

/* ---- Image card: a body image in the shared fence with a copy action ---- */
/* The card wraps the picture instead of spanning the column, so a portrait
   screenshot never sits in a wide empty frame. The picture keeps the column
   width; the component then caps its height at 1.5x that width (A4 portrait
   is 1.41), so only over-long pictures are scaled down. The height below is
   the pre-measurement fallback. */
.dshr-image {
  position: relative;
  box-sizing: border-box;
  width: fit-content;
  max-width: 100%;
  padding: 10px;
}

.dshr-image-img {
  display: block;
  max-width: 100%;
  max-height: 1200px;
  height: auto;
  margin: 0;
  border-radius: var(--dsw-radius-md, 8px);
}

/* Icon-only copy action: the platform's clipboard glyph on a frosted surface,
   so it stays readable over whatever picture sits underneath. */
.dshr-image-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: var(--dsw-radius-sm, 8px);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 82%, transparent);
  box-shadow: 0 0 0 0.5px var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}

.dshr-image-copy:hover {
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
}

.dshr-image-copy[data-state='error'] {
  color: var(--dsw-alias-state-error-primary);
}

.dshr-image-copy:focus-visible {
  outline: 2px solid var(--dsw-alias-link);
  outline-offset: 2px;
}

/* The failed card names the authored destination, so a wrong extension or a
   misspelled folder shows up on screen instead of in a console. */
.dshr-image-failed {
  padding: 8px 12px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 20px;
  overflow-wrap: anywhere;
}

/* ---- Icon-card group ---- */
.dshr-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dshr-cards-title {
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}

.dshr-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.dshr-card {
  display: flex;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-md, 8px);
  background: var(--dsw-alias-bg-layer-1);
  min-width: 0;
}

.dshr-card-main {
  min-width: 0;
}

.dshr-card-title {
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
  margin-bottom: 4px;
  overflow-wrap: anywhere;
}

.dshr-card-body {
  color: var(--dsw-alias-label-secondary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
}

/* ---- Callout ---- */
.dshr-callout {
  padding: 10px 14px;
  border-left: 3px solid var(--dsw-alias-border-l3);
  border-radius: 0 var(--dsw-radius-md, 8px) var(--dsw-radius-md, 8px) 0;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
}

/* GitHub alert flavors: one accent variable per type, GitHub's palette. */
.dshr-callout-alert {
  --dshr-alert-accent: var(--dsw-alias-label-secondary, #57606a);
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  border-left: 3px solid var(--dshr-alert-accent);
  border-radius: 0 var(--dsw-radius-md, 8px) var(--dsw-radius-md, 8px) 0;
  background: color-mix(in srgb, var(--dshr-alert-accent) 8%, transparent);
}

.dshr-callout-note { --dshr-alert-accent: #0969da; }
.dshr-callout-tip { --dshr-alert-accent: #1a7f37; }
.dshr-callout-important { --dshr-alert-accent: #8250df; }
.dshr-callout-warning { --dshr-alert-accent: #9a6700; }
.dshr-callout-caution { --dshr-alert-accent: #cf222e; }

.dshr-callout-alert-icon {
  flex: none;
  margin-top: 2px;
  color: var(--dshr-alert-accent);
}

.dshr-callout-alert-main {
  min-width: 0;
  flex: 1;
}

.dshr-callout-alert-title {
  color: var(--dshr-alert-accent);
  font-weight: 600;
  font-size: calc(14px + var(--dsh-content-font-delta-primary, 0px));
  line-height: calc(20px + var(--dsh-content-font-delta-primary, 0px));
  margin: 1px 0 2px;
}

/* ---- Checklist ---- */
.dshr-checklist {
  display: flex;
  flex-direction: column;
  padding: 20px 22px 22px;
  background: var(--dsw-alias-bg-layer-1);
}

.dshr-checklist-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.dshr-checklist-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
}

.dshr-checklist-count {
  flex: none;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums;
}

.dshr-checklist-track {
  height: 4px;
  margin: 12px 0 18px;
  border-radius: 2px;
  background: var(--dsw-alias-border-l1);
  overflow: hidden;
}

.dshr-checklist-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--dsw-alias-label-primary);
  transition: width 160ms ease;
}

.dshr-checklist-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.dshr-checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

/* The platform's checkbox recipe (ui-primitives Checkbox): a native input at
   16px tinted with the brand accent, centred in a 24px hit area so the box
   stays on the title's first line without a drawn glyph. */
.dshr-checklist-check {
  flex: none;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 24px;
  height: 22px;
  margin: 0;
  cursor: pointer;
}

.dshr-checklist-input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary);
  cursor: inherit;
}

.dshr-checklist-input:focus-visible {
  outline: 2px solid var(--dsw-alias-link);
  outline-offset: 2px;
}

.dshr-checklist-main {
  flex: 1;
  min-width: 0;
}

.dshr-checklist-item-title {
  font-weight: 600;
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
  overflow-wrap: anywhere;
}

.dshr-checklist-item-body {
  margin-top: 2px;
  color: var(--dsw-alias-label-secondary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
}

@media (prefers-reduced-motion: reduce) {
  .dshr-checklist-fill {
    transition: none;
  }
}

/* ---- Styled table ---- */
/* Minimal table: no verticals, no frame, no zebra — horizontal rules only
 * (under the header and between rows, none after the last row), bold
 * borderless header, airy even padding. */
.dshr-table-wrap {
  overflow-x: auto;
}

.dshr-table {
  border-collapse: collapse;
  width: 100%;
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
}

.dshr-table th {
  padding: 12px 16px 10px;
  font-weight: 700;
  vertical-align: middle;
  color: var(--dsw-alias-label-primary);
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  text-align: start;
  white-space: nowrap;
}

.dshr-table td {
  padding: 11px 16px;
  vertical-align: middle;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-primary);
  overflow-wrap: anywhere;
}

.dshr-table tbody tr:last-child td {
  border-bottom: none;
}

.dshr-tableblock {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ---- Dual-view bar ---- */
.dshr-dual {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Both panes stay mounted so export works from either view. */
.dshr-dual-pane {
  display: none;
}

.dshr-dual-pane[data-active] {
  display: block;
}

/* ---- Chart fence toolbar: icon views plus chart actions, right-aligned ----
   Shared by the dual-view table and the matplotlib cell so both fences put
   the same controls in the same place; labels live in tooltips. */
.dshr-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  margin-bottom: 8px;
}

.dshr-toolbar-views {
  display: flex;
  align-items: center;
  gap: 2px;
}

.dshr-toolbar-sep {
  width: 1px;
  height: 14px;
  margin: 0 6px;
  background: var(--dsw-alias-border-l2);
}

.dshr-toolbar-btn {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm, 8px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}

.dshr-toolbar-btn .dshr-icon {
  display: block;
}

.dshr-toolbar-btn:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.dshr-toolbar-btn[data-active] {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.dshr-toolbar-btn[data-state='error'] {
  color: var(--dsw-alias-state-error-primary);
}

.dshr-toolbar-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.dshr-toolbar-btn:focus-visible {
  outline: 2px solid var(--dsw-alias-link);
  outline-offset: 2px;
}

/* ---- Tab fence: equal-width line tabs with an underline indicator ---- */
.dshr-tabs {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 14px;
}

.dshr-tabs-bar {
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}

.dshr-tabs-tab {
  flex: 1 0 auto;
  position: relative;
  padding: 8px 9px 10px;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
}

.dshr-tabs-tab:hover {
  color: var(--dsw-alias-label-primary);
}

.dshr-tabs-tab[data-active] {
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}

.dshr-tabs-tab[data-active]::after {
  content: '';
  position: absolute;
  left: 9px;
  right: 9px;
  bottom: -1px;
  height: 2px;
  border-radius: 1px;
  background: var(--dsw-alias-label-primary);
}

.dshr-tabs-pane {
  min-width: 0;
}

/* ---- Prototype choices: native radio options over a live showcase panel ---- */
.dshr-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
}

.dshr-choices-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dshr-choices-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: var(--dsw-radius-sm, 6px);
  color: var(--dsw-alias-label-secondary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 20px;
  cursor: pointer;
}

.dshr-choices-option:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshr-choices-option[data-active] {
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}

/* The platform's radio recipe (Checkbox / plugin manager): a native input at
   16px tinted with the brand accent. The browser draws the ring, the centred
   dot, and the focus ring, so no glyph is positioned by hand. */
.dshr-choices-input {
  flex: none;
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary);
  cursor: inherit;
}

.dshr-choices-input:focus-visible {
  outline: 2px solid var(--dsw-alias-link);
  outline-offset: 2px;
}

.dshr-choices-label {
  min-width: 0;
  overflow-wrap: anywhere;
}

.dshr-choices-panel {
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-md, 8px);
  padding: 12px 16px;
  overflow-x: auto;
}

/* ---- Charts ---- */
.dshr-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 4px 4px;
}

.dshr-chart-svg {
  width: 100%;
  height: auto;
}

.dshr-chart-grid {
  stroke: var(--dsw-alias-border-l1);
  stroke-width: 1;
}

.dshr-chart-axis {
  stroke: var(--dsw-alias-border-l2);
  stroke-width: 1;
}

.dshr-chart-tick {
  fill: var(--dsw-alias-label-tertiary);
  font-size: 10px;
}

.dshr-chart-bar {
  cursor: default;
}

.dshr-chart-point {
  cursor: default;
}

.dshr-chart-slice {
  cursor: default;
}

.dshr-chart-slice-supplement {
  opacity: 0.5;
}

.dshr-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}

.dshr-chart-legend-column {
  flex-direction: column;
  gap: 6px;
}

.dshr-chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 1px 4px;
  border: none;
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}

.dshr-chart-legend-item[data-off] {
  opacity: 0.45;
}

.dshr-chart-legend-item[data-supplement] {
  cursor: default;
}

.dshr-chart-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 4px;
}

.dshr-chart-dot-supplement {
  background: var(--dsw-alias-label-caption);
}

.dshr-chart-legend-name {
  color: var(--dsw-alias-label-primary);
}

.dshr-chart-legend-value {
  color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums;
}

.dshr-chart-pie {
  flex-direction: row;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.dshr-chart-svg-pie {
  width: 176px;
  flex: none;
}

.dshr-chart-pie-side {
  min-width: 0;
}

/* ---- Timeline ---- */
.dshr-timelinewrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
}

.dshr-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.dshr-timeline-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 0 0 16px 0;
}

/* Vertical rail through the dots. */
.dshr-timeline-item::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 24px;
  bottom: 0;
  width: 1px;
  background: var(--dsw-alias-border-l2);
}

.dshr-timeline-item:last-child {
  padding-bottom: 4px;
}

.dshr-timeline-item:last-child::before {
  display: none;
}

.dshr-timeline-dot {
  flex: none;
  display: grid;
  place-items: center;
  width: 23px;
  height: 23px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  z-index: 1;
}

.dshr-timeline-main {
  min-width: 0;
  padding-top: 2px;
}

.dshr-timeline-title {
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
  margin-bottom: 4px;
}

.dshr-timeline-body {
  color: var(--dsw-alias-label-secondary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
}

/* ---- Mindmap fence: bare-text nodes, branch-colored underlines, bump-curve
   connectors (markmap-family look). The box budget decreases with depth: only
   the root keeps a box (a solid pill); every deeper level is text anchored by
   a colored underline. ---- */
.dshr-mm {
  position: relative;
  padding: 12px;
}

.dshr-mm-scroll {
  overflow: auto;
}

.dshr-mm-zoompane {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: fit-content;
  min-width: 100%;
}

.dshr-mm-tree {
  display: flex;
  align-items: center;
  width: fit-content;
}

.dshr-mm-item {
  display: flex;
  align-items: center;
}

/* Level-2-and-deeper text node. The underline is a bottom background stripe
   over 3px of padding, so descenders and inline-math subscripts never touch
   it; it spans the whole block width when a label wraps at max-width. */
.dshr-mm-node {
  max-width: 240px;
  padding: 0 0 3px;
  background-image: linear-gradient(var(--dshr-mm-branch, transparent), var(--dshr-mm-branch, transparent));
  background-repeat: no-repeat;
  background-size: 100% 1.5px;
  background-position: 0 100%;
  font-size: 13px;
  line-height: 19px;
  font-weight: 400;
  color: var(--dsw-alias-label-secondary);
  overflow-wrap: anywhere;
}

/* Level-1 branch label: one size up, primary ink, heavier underline. */
.dshr-mm-level-1 {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
  background-size: 100% 2px;
}

/* The root keeps the only box: a solid pill in the primary label pair, the
   same tokens the checklist selected state uses, so both themes follow. */
.dshr-mm-root {
  padding: 5px 16px;
  border-radius: 999px;
  background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-label-primary-inverted);
  font-size: 15px;
  line-height: 22px;
  font-weight: 600;
}

/* Branch palette: four hues cycling over each root's level-1 branches and
   inherited by the whole subtree (underline and connectors). The platform has
   no categorical-color token, so the values are plugin-owned, with a lifted
   set for dark surfaces. */
.dshr-mm-b1 { --dshr-mm-branch: #3b82f6; }
.dshr-mm-b2 { --dshr-mm-branch: #0d9488; }
.dshr-mm-b3 { --dshr-mm-branch: #d97706; }
.dshr-mm-b4 { --dshr-mm-branch: #7c3aed; }

body[data-ds-dark-theme] .dshr-mm-b1 { --dshr-mm-branch: #60a5fa; }
body[data-ds-dark-theme] .dshr-mm-b2 { --dshr-mm-branch: #2dd4bf; }
body[data-ds-dark-theme] .dshr-mm-b3 { --dshr-mm-branch: #fbbf24; }
body[data-ds-dark-theme] .dshr-mm-b4 { --dshr-mm-branch: #a78bfa; }

.dshr-mm-children {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* The 40px left padding is the horizontal gap; the connector lives inside it. */
.dshr-mm-child {
  position: relative;
  padding-left: 40px;
}

/* One connector per child: an inline SVG whose path is written after layout by
   the fit pass, from the parent exit (the children column's centerline) to the
   child's center. Each SVG box spans just the curve's vertical extent; overflow
   stays visible so neither the stroke nor its round caps are clipped. Both ends
   stop short of their node, so the line never touches the root pill or the first
   glyph. Before the fit runs the path carries no path data and paints nothing,
   so a missing measurement never shows a half-drawn line. */
.dshr-mm-edge {
  position: absolute;
  left: 0;
  display: block;
  width: 40px;
  overflow: visible;
  pointer-events: none;
}

.dshr-mm-edge-path {
  fill: none;
  stroke: var(--dshr-mm-branch, var(--dsw-alias-border-l2));
  stroke-width: 1.5px;
  stroke-linecap: round;
}

/* Root-to-branch connectors carry the heaviest stroke; deeper ones stay 1.5px.
   The direct-child selector keeps nested levels at the lighter width. */
.dshr-mm-child-l1 > .dshr-mm-edge .dshr-mm-edge-path {
  stroke-width: 2px;
}

.dshr-mm-zoom {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  justify-content: flex-end;
}

.dshr-mm-zoombtn, .dshr-mm-zoomreset {
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
  border-radius: 6px;
  height: 24px;
  padding: 0 8px;
  cursor: pointer;
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
}

.dshr-mm-zoombtn {
  width: 24px;
  padding: 0;
}

.dshr-mm-zoombtn:disabled {
  opacity: 0.4;
  cursor: default;
}

.dshr-mm-zoomreset {
  min-width: 44px;
  color: var(--dsw-alias-label-caption);
}

/* ---- Tree fence ---- */
.dshr-tree {
  padding: 10px 12px;
  overflow-x: auto;
  font-size: 13px;
}

.dshr-tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  white-space: nowrap;
  min-width: max-content;
}

.dshr-tree-toggle {
  width: 14px;
  height: 14px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: var(--dsw-alias-label-caption);
  font-size: 10px;
  line-height: 1;
  flex: none;
}

.dshr-tree-children {
  margin-left: 14px;
  padding-left: 8px;
  border-left: 1px solid var(--dsw-alias-border-l1);
}

.dshr-tree-name {
  color: var(--dsw-alias-label-primary);
}

.dshr-tree-icon {
  flex: none;
}

/* ---- Stack fence ---- */
.dshr-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
}

.dshr-stack-layer {
  display: flex;
  align-items: stretch;
  gap: 10px;
  width: 100%;
}

.dshr-stack-box {
  flex: 1 1 0;
  min-width: 0;
  background: var(--dsw-static-neutral-100);
  border-radius: 8px;
  padding: 10px 12px;
  overflow-wrap: anywhere;
}

body[data-ds-dark-theme] .dshr-stack-box {
  background: var(--dsw-alias-bg-layer-2);
}

.dshr-stack-box * {
  color: inherit;
}

/* ---- Matplotlib cell ---- */
.dshr-mpl {
  padding: 10px 12px;
}

.dshr-mpl-chart {
  overflow: auto;
  text-align: center;
}

.dshr-mpl-chart img {
  max-width: 100%;
}

.dshr-mpl-note {
  color: var(--dsw-alias-label-caption);
  font-size: 13px;
}

.dshr-mpl-error {
  color: var(--dsw-alias-label-warning, #d97706);
}

.dshr-mpl-stderr {
  text-align: left;
  font-size: 12px;
  white-space: pre-wrap;
  background: var(--dsw-alias-bg-base);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  padding: 8px;
  max-height: 240px;
  overflow: auto;
}

/* ---- Inline markdown fields (titles, table cells, node labels) ----
   Those fields keep model-authored markdown, notably $...$ TeX, and render
   through the platform MarkdownText. Its root is document-oriented, so this
   wrapper collapses the root box and its paragraph onto the host line and
   inherits the host typography. */
.dshr-inline-md,
.dshr-inline-md > div,
.dshr-inline-md > div > p {
  display: inline;
  margin: 0;
  font: inherit;
  color: inherit;
  line-height: inherit;
  overflow-wrap: anywhere;
}

.dshr-inline-md .katex-display {
  margin: 0;
}

/* ---- Watermark layer (four knobs; decoration never carries pointers) ---- */
.dshr-wm {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 40;
}

.dshr-wm-img {
  position: absolute;
  max-width: var(--dshr-wm-size, 42vmin);
  max-height: var(--dshr-wm-size, 42vmin);
  filter: grayscale(1);
  mix-blend-mode: multiply;
  user-select: none;
  pointer-events: none;
}

.dshr-wm[data-corner='tl'] .dshr-wm-img { top: 24px; left: 24px; }
.dshr-wm[data-corner='tr'] .dshr-wm-img { top: 24px; right: 24px; }
.dshr-wm[data-corner='bl'] .dshr-wm-img { bottom: 24px; left: 24px; }
.dshr-wm[data-corner='br'] .dshr-wm-img { bottom: 24px; right: 24px; }

.dshr-wm-gear {
  position: absolute;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  opacity: 0.4;
  cursor: pointer;
  pointer-events: auto;
  transition: opacity 120ms ease;
}

.dshr-wm-gear:hover { opacity: 1; }

.dshr-wm[data-corner='tl'] .dshr-wm-gear { top: 6px; left: 6px; }
.dshr-wm[data-corner='tr'] .dshr-wm-gear { top: 6px; right: 6px; }
.dshr-wm[data-corner='bl'] .dshr-wm-gear { bottom: 6px; left: 6px; }
.dshr-wm[data-corner='br'] .dshr-wm-gear { bottom: 6px; right: 6px; }

.dshr-wm-scrim {
  position: fixed;
  inset: 0;
  background: transparent;
  pointer-events: auto;
}

.dshr-wm-panel {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 280px;
  padding: 14px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-lg, 12px);
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  pointer-events: auto;
}

.dshr-wm[data-corner='tl'] .dshr-wm-panel,
.dshr-wm[data-corner='tr'] .dshr-wm-panel { top: 38px; }
.dshr-wm[data-corner='bl'] .dshr-wm-panel,
.dshr-wm[data-corner='br'] .dshr-wm-panel { bottom: 38px; }
.dshr-wm[data-corner='tl'] .dshr-wm-panel,
.dshr-wm[data-corner='bl'] .dshr-wm-panel { left: 38px; }
.dshr-wm[data-corner='tr'] .dshr-wm-panel,
.dshr-wm[data-corner='br'] .dshr-wm-panel { right: 38px; }

.dshr-wm-panel-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dshr-wm-panel-col {
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
}

.dshr-wm-panel-head {
  justify-content: space-between;
}

.dshr-wm-panel-title {
  font-weight: 600;
}

.dshr-wm-close {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 16px;
  cursor: pointer;
}

.dshr-wm-image-row {
  display: flex;
  gap: 6px;
}

.dshr-wm-input {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
}

.dshr-wm-button {
  flex: none;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  cursor: pointer;
}

.dshr-wm-corners {
  display: flex;
  gap: 4px;
}

.dshr-wm-corner {
  padding: 2px 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  cursor: pointer;
}

.dshr-wm-corner[data-active] {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.dshr-wm-value {
  min-width: 34px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-secondary);
}
`
