/**
 * Bilingual dictionary for this plugin's locale namespace. The slot renderer
 * synthesizes the `t` seat from the registration's `locale: NS`; a key with
 * no entry returns the key itself (LocaleRuntime lookup contract).
 */

export const NS = 'richRender'

export const zh: Readonly<Record<string, string>> = {
  // Flow chrome (mirrors ui-chat's chat namespace copy).
  stopped: '已停止',
  think: '思考',
  running: '正在生成…',
  unknownBlock: '未识别的消息块',
  truncated: '内容已截断（共 {total} 项）',
  copy: '复制',
  copied: '已复制',
  codeBlockTitle: '代码块',
  codeBlockWrap: '自动换行',
  codeBlockUnwrap: '取消换行',
  footnotes: '脚注',
  // Dual-view table chrome.
  viewTable: '表格',
  viewChart: '图表',
  downloadChart: '下载图片',
  otherSlice: '其他',
  // Checklist chrome.
  checklistTitle: '检查清单',
  checklistProgress: '{done}/{total} 项完成',
  // Matplotlib cell chrome.
  mplCode: '代码',
  mplChart: '图表',
  mplDownload: '下载',
  mplRunning: '正在执行…',
  mplFailed: '执行失败',
  mplDownloadPng: '下载 PNG',
  // Callout alert titles (GitHub alert flavors).
  calloutNote: '注意',
  calloutTip: '提示',
  calloutImportant: '重要',
  calloutWarning: '警告',
  calloutCaution: '危险',
  // Watermark layer chrome.
  wmTitle: '水印设置',
  wmClose: '关闭',
  wmEnable: '启用水印',
  wmImage: '水印图片',
  wmPick: '选择图片…',
  wmOpacity: '透明度',
  wmCorner: '位置',
  wmCornerTl: '左上',
  wmCornerTr: '右上',
  wmCornerBl: '左下',
  wmCornerBr: '右下',
  wmSize: '大小',
}

export const en: Readonly<Record<string, string>> = {
  stopped: 'Stopped',
  think: 'Thinking',
  running: 'Generating…',
  unknownBlock: 'Unrecognized message block',
  truncated: 'Truncated ({total} items total)',
  copy: 'Copy',
  copied: 'Copied',
  codeBlockTitle: 'Code block',
  codeBlockWrap: 'Wrap lines',
  codeBlockUnwrap: 'Unwrap lines',
  footnotes: 'Footnotes',
  // Dual-view table chrome.
  viewTable: 'Table',
  viewChart: 'Chart',
  downloadChart: 'Download image',
  otherSlice: 'Other',
  // Checklist chrome.
  checklistTitle: 'Checklist',
  checklistProgress: '{done}/{total} done',
  // Matplotlib cell chrome.
  mplCode: 'Code',
  mplChart: 'Chart',
  mplDownload: 'Download',
  mplRunning: 'Running…',
  mplFailed: 'Execution failed',
  mplDownloadPng: 'Download PNG',
  // Callout alert titles (GitHub alert flavors).
  calloutNote: 'Note',
  calloutTip: 'Tip',
  calloutImportant: 'Important',
  calloutWarning: 'Warning',
  calloutCaution: 'Caution',
  // Watermark layer chrome.
  wmTitle: 'Watermark settings',
  wmClose: 'Close',
  wmEnable: 'Enable watermark',
  wmImage: 'Watermark image',
  wmPick: 'Pick image…',
  wmOpacity: 'Opacity',
  wmCorner: 'Corner',
  wmCornerTl: 'Top left',
  wmCornerTr: 'Top right',
  wmCornerBl: 'Bottom left',
  wmCornerBr: 'Bottom right',
  wmSize: 'Size',
}
