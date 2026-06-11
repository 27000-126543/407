import dayjs from 'dayjs'
import type { Pump, PumpUnit, WeatherForecast, PipelineNode, Schedule } from '@/types'

export interface ScheduleInput {
  pumps: Pump[]
  weatherForecast: WeatherForecast[]
  pipelineLevels: PipelineNode[]
  date: string
}

export interface GeneratedSchedule {
  pumpId: number
  pumpName: string
  scheduleDate: string
  planStartTime: string
  planEndTime: string
  plannedFlow: number
  operatingUnits: number[]
  reason: string
  constraints: string
}

const RAINFALL_FLOW_COEFF = {
  light: 0.3,
  moderate: 0.5,
  heavy: 0.8,
  storm: 1.2
}

const TIDE_INFLUENCE_THRESHOLD = 2.5
const PEAK_HOURS_MORNING = [6, 7, 8, 9]
const PEAK_HOURS_EVENING = [17, 18, 19, 20]

export function generateDailySchedules(input: ScheduleInput): GeneratedSchedule[] {
  const { pumps, weatherForecast, pipelineLevels, date } = input
  const schedules: GeneratedSchedule[] = []

  const dayWeather = weatherForecast.find(w => w.forecastDate === date)
  if (!dayWeather) return schedules

  const rainfallCoeff = RAINFALL_FLOW_COEFF[dayWeather.rainfallIntensity] || 0.3
  const hasTideConstraint = (dayWeather.tideLevel || 0) > TIDE_INFLUENCE_THRESHOLD

  const sortedPumps = sortPumpsByDependency(pumps)

  sortedPumps.forEach(pump => {
    const schedule = generatePumpSchedule(
      pump, dayWeather, rainfallCoeff, hasTideConstraint, pipelineLevels, date, pumps
    )
    if (schedule) {
      schedules.push(schedule)
    }
  })

  return schedules
}

function sortPumpsByDependency(pumps: Pump[]): Pump[] {
  const visited = new Set<number>()
  const result: Pump[] = []

  function visit(pumpId: number) {
    if (visited.has(pumpId)) return
    visited.add(pumpId)

    const pump = pumps.find(p => p.id === pumpId)
    if (!pump) return

    pump.upstreamPumpIds.forEach(upId => visit(upId))
    result.push(pump)
  }

  pumps.forEach(pump => visit(pump.id))
  return result
}

function generatePumpSchedule(
  pump: Pump,
  weather: WeatherForecast,
  rainfallCoeff: number,
  hasTideConstraint: boolean,
  pipelineLevels: PipelineNode[],
  date: string,
  allPumps: Pump[]
): GeneratedSchedule | null {
  const baseFlow = pump.designFlow * rainfallCoeff
  const forecastFlow = Math.min(baseFlow, pump.designFlow)

  if (forecastFlow < pump.designFlow * 0.1 && weather.rainfall < 5) {
    return null
  }

  const upstreamPumps = allPumps.filter(p => pump.upstreamPumpIds.includes(p.id))
  const downstreamPumps = allPumps.filter(p => pump.downstreamPumpIds.includes(p.id))

  const startTime = calculateOptimalStartTime(weather, hasTideConstraint, upstreamPumps, downstreamPumps)
  const duration = calculateOperatingDuration(forecastFlow, pump.designFlow, weather.rainfall24h)
  const endTime = dayjs(date + ' ' + startTime).add(duration, 'hour').format('HH:mm')

  const unitsNeeded = calculateUnitsNeeded(pump, forecastFlow)
  const operatingUnits = selectOperatingUnits(pump, unitsNeeded)

  const reasons = buildScheduleReason(weather, forecastFlow, pump)
  const constraints = buildConstraints(hasTideConstraint, upstreamPumps, downstreamPumps, pipelineLevels)

  return {
    pumpId: pump.id,
    pumpName: pump.name,
    scheduleDate: date,
    planStartTime: startTime,
    planEndTime: endTime,
    plannedFlow: Math.round(forecastFlow),
    operatingUnits,
    reason: reasons,
    constraints
  }
}

function calculateOptimalStartTime(
  weather: WeatherForecast,
  hasTideConstraint: boolean,
  upstreamPumps: Pump[],
  downstreamPumps: Pump[]
): string {
  let hour = 4

  if (weather.rainfallIntensity === 'storm' || weather.rainfallIntensity === 'heavy') {
    hour = 2
  }

  if (hasTideConstraint) {
    hour = Math.min(hour, 1)
  }

  if (upstreamPumps.length > 0) {
    hour = Math.max(hour, 5)
  }

  if (downstreamPumps.length > 0) {
    hour = Math.min(hour, 3)
  }

  if (PEAK_HOURS_MORNING.includes(hour)) {
    hour = hour < 6 ? hour : 10
  }
  if (PEAK_HOURS_EVENING.includes(hour)) {
    hour = hour < 17 ? hour : 21
  }

  return `${String(hour).padStart(2, '0')}:00`
}

function calculateOperatingDuration(
  forecastFlow: number,
  designFlow: number,
  rainfall24h: number
): number {
  const flowRatio = forecastFlow / designFlow
  let duration = 6

  if (rainfall24h > 100) duration = 16
  else if (rainfall24h > 50) duration = 12
  else if (rainfall24h > 25) duration = 10
  else if (rainfall24h > 10) duration = 8
  else if (rainfall24h < 5) duration = 4

  duration = Math.round(duration * (0.5 + flowRatio * 0.5))
  return Math.max(2, Math.min(20, duration))
}

function calculateUnitsNeeded(pump: Pump, forecastFlow: number): number {
  const units = pump.units || []
  const mainUnits = units.filter((u: PumpUnit) => !u.isBackup)
  const unitCapacity = mainUnits.length > 0 ? pump.designFlow / mainUnits.length : pump.designFlow

  let unitsNeeded = Math.ceil(forecastFlow / unitCapacity)
  unitsNeeded = Math.max(1, Math.min(unitsNeeded, mainUnits.length))

  return unitsNeeded
}

function selectOperatingUnits(pump: Pump, unitsNeeded: number): number[] {
  const units = pump.units || []
  const mainUnits = units.filter((u: PumpUnit) => !u.isBackup && u.status !== 'fault')
    .sort((a: PumpUnit, b: PumpUnit) => (a.runtime || 0) - (b.runtime || 0))

  const selected = mainUnits.slice(0, unitsNeeded).map((u: PumpUnit) => u.id)
  return selected
}

function buildScheduleReason(weather: WeatherForecast, forecastFlow: number, pump: Pump): string {
  const reasons: string[] = []

  const intensityMap: Record<string, string> = {
    light: '小雨',
    moderate: '中雨',
    heavy: '大雨',
    storm: '暴雨'
  }

  reasons.push(`预计${intensityMap[weather.rainfallIntensity] || '降雨'}，24小时降雨量${weather.rainfall24h.toFixed(1)}mm`)
  reasons.push(`预测管网流量约${forecastFlow.toFixed(0)}m³/h`)
  reasons.push(`占泵站设计能力${(forecastFlow / pump.designFlow * 100).toFixed(1)}%`)

  return reasons.join('；')
}

function buildConstraints(
  hasTideConstraint: boolean,
  upstreamPumps: Pump[],
  downstreamPumps: Pump[],
  pipelineLevels: PipelineNode[]
): string {
  const constraints: string[] = []

  if (hasTideConstraint) {
    constraints.push('潮汐顶托影响，需在低潮位时段优先运行')
  }

  if (upstreamPumps.length > 0) {
    constraints.push(`需与上游泵站[${upstreamPumps.map(p => p.name).join('、')}]联动，错峰运行`)
  }

  if (downstreamPumps.length > 0) {
    constraints.push(`需为下游泵站[${downstreamPumps.map(p => p.name).join('、')}]预留调蓄空间`)
  }

  const highLevelNodes = pipelineLevels.filter(n => (n.currentLevel || 0) > n.warningLevel * 0.8)
  if (highLevelNodes.length > 0) {
    constraints.push(`管网高水位节点：${highLevelNodes.map(n => n.name).join('、')}`)
  }

  return constraints.length > 0 ? constraints.join('；') : '无特殊约束'
}

export function validateSchedule(schedule: any, pumps: Pump[]): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []
  const pump = pumps.find(p => p.id === schedule.pumpId)

  if (!pump) {
    return { valid: false, warnings: ['泵站不存在'] }
  }

  if (schedule.plannedFlow > pump.designFlow) {
    warnings.push('计划流量超过泵站设计流量')
  }

  if (schedule.plannedFlow < 0) {
    warnings.push('计划流量不能为负数')
  }

  const start = dayjs(schedule.scheduleDate + ' ' + schedule.planStartTime)
  const end = dayjs(schedule.scheduleDate + ' ' + schedule.planEndTime)
  if (end.isBefore(start)) {
    warnings.push('结束时间不能早于开始时间')
  }

  if (schedule.operatingUnits.length === 0) {
    warnings.push('至少选择一台运行机组')
  }

  return {
    valid: warnings.length === 0,
    warnings
  }
}
