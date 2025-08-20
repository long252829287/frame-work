export interface FeatureItem {
  icon: string
  title: string
  desc: string
  to?: string
}

export const FEATURES: FeatureItem[] = [
  { icon: '🧠', title: '智能标签', desc: '自动识别关键词，给你的笔记打上贴切的标签。' },
  { icon: '⚡', title: '快捷操作', desc: '键盘优先的设计，行云流水般的编辑体验。' },
  { icon: '☁️', title: '云端同步', desc: '多设备无缝衔接，随时随地访问你的灵感。' },
  { icon: '🔒', title: '安全加密', desc: '端到端加密，保护你的隐私与数据安全。' },
  { icon: '🧩', title: '插件拓展', desc: '开放的扩展接口，满足个性化需求。' },
  { icon: '📈', title: '统计概览', desc: '可视化统计助你更好地管理与复盘。' },
]

export interface StatItem {
  value: string
  label: string
}

export const STATS: StatItem[] = [
  { value: '1K+', label: '日活用户' },
  { value: '99.9%', label: '可用性' },
  { value: '极速', label: '打开与保存' },
]
