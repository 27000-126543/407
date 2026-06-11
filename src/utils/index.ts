import dayjs from 'dayjs'

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

export function formatTime(date: string | Date): string {
  return dayjs(date).format('HH:mm:ss')
}

export function formatNumber(num: number, decimals = 2): string {
  return num.toFixed(decimals)
}

export function formatFlow(flow: number): string {
  if (flow >= 10000) {
    return (flow / 10000).toFixed(2) + '万'
  }
  return flow.toFixed(1)
}

export function getStatusText(status: string): string {
  const map: Record<string, string> = {
    running: '运行中',
    standby: '待机',
    maintenance: '维护中',
    fault: '故障'
  }
  return map[status] || status
}

export function getScheduleStatusText(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    pending_approval: '待审批',
    approved: '已批准',
    rejected: '已驳回',
    adjust_requested: '申请调整',
    confirmed: '已确认',
    executed: '已执行'
  }
  return map[status] || status
}

export function getScheduleStatusType(status: string): string {
  const map: Record<string, string> = {
    draft: 'info',
    pending_approval: 'warning',
    approved: 'success',
    rejected: 'danger',
    adjust_requested: 'warning',
    confirmed: 'primary',
    executed: 'success'
  }
  return map[status] || 'info'
}

export function getAlertLevelText(level: string): string {
  const map: Record<string, string> = {
    warning: '预警',
    danger: '危险',
    critical: '紧急'
  }
  return map[level] || level
}

export function getAlertLevelType(level: string): string {
  const map: Record<string, string> = {
    warning: 'warning',
    danger: 'danger',
    critical: 'danger'
  }
  return map[level] || 'info'
}

export function getRainfallIntensityText(intensity: string): string {
  const map: Record<string, string> = {
    light: '小雨',
    moderate: '中雨',
    heavy: '大雨',
    storm: '暴雨'
  }
  return map[intensity] || intensity
}

export function getMaintenancePriorityText(priority: string): string {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return map[priority] || priority
}

export function getMaintenancePriorityType(priority: string): string {
  const map: Record<string, string> = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    urgent: 'danger'
  }
  return map[priority] || 'info'
}

export function getMaintenanceStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待处理',
    in_progress: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

export function getMaintenanceStatusType(status: string): string {
  const map: Record<string, string> = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

export function getLevelColor(level: number, maxLevel: number, warningLevel: number): string {
  const ratio = level / maxLevel
  if (level >= warningLevel) return '#f56c6c'
  if (ratio >= 0.7) return '#e6a23c'
  if (ratio >= 0.5) return '#f0c78a'
  return '#67c23a'
}

export function playAlertSound(level: string) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  const freq = level === 'critical' ? 800 : level === 'danger' ? 600 : 400
  const duration = level === 'critical' ? 0.5 : 0.3
  const repeat = level === 'critical' ? 3 : level === 'danger' ? 2 : 1

  oscillator.frequency.value = freq
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

  for (let i = 0; i < repeat; i++) {
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.4)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.4 + duration)
  }

  oscillator.start()
  oscillator.stop(audioContext.currentTime + repeat * 0.4)
}
