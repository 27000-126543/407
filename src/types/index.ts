export interface Pump {
  id: number
  name: string
  code: string
  location: string
  longitude: number
  latitude: number
  basin: string
  designFlow: number
  actualFlow?: number
  head: number
  power: number
  equipmentModel: string
  manufacturer: string
  installDate: string
  ratedCurrent: number
  maxCurrent: number
  forebayWarningLevel: number
  forebayDangerLevel: number
  upstreamPumpIds: number[]
  downstreamPumpIds: number[]
  status: 'running' | 'standby' | 'maintenance' | 'fault'
  totalRuntime: number
  startCount: number
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  createTime: string
  updateTime: string
  units?: PumpUnit[]
}

export interface PumpUnit {
  id: number
  pumpId: number
  unitNumber: string
  equipmentModel: string
  ratedFlow: number
  ratedHead: number
  ratedPower: number
  ratedCurrent: number
  status: 'running' | 'standby' | 'fault'
  isBackup: boolean
  current?: number
  flow?: number
  head?: number
  runtime: number
  startCount: number
}

export interface Schedule {
  id: number
  scheduleDate: string
  pumpId: number
  pumpName: string
  planStartTime: string
  planEndTime: string
  plannedFlow: number
  operatingUnits: number[]
  reason: string
  constraints: string
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'adjust_requested' | 'confirmed' | 'executed'
  approver?: string
  approvalComment?: string
  approvalTime?: string
  operator?: string
  confirmTime?: string
  adjustReason?: string
  adjustRequestTime?: string
  createTime: string
  updateTime: string
}

export interface MonitoringData {
  id: number
  pumpId: number
  unitId?: number
  timestamp: string
  current: number
  voltage: number
  flow: number
  head: number
  forebayLevel: number
  outletPressure: number
  vibration: number
  temperature: number
  isAlert: boolean
  alertLevel?: 'warning' | 'danger'
}

export interface Alert {
  id: number
  pumpId: number
  unitId?: number
  alertType: string
  alertLevel: 'warning' | 'danger' | 'critical'
  parameter: string
  actualValue: number
  threshold: number
  message: string
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedTime?: string
  autoAction?: string
  autoActionResult?: string
}

export interface MaintenanceOrder {
  id: number
  orderNo: string
  pumpId: number
  unitId?: number
  type: 'preventive' | 'corrective' | 'predictive'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  triggerReason: string
  triggerValue: { runtime?: number; startCount?: number }
  assignedTeam: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  partsRequired: { partId: number; partName: string; quantity: number }[]
  planDate: string
  actualStartDate?: string
  actualEndDate?: string
  remark?: string
  createTime: string
}

export interface InventoryItem {
  id: number
  partNo: string
  partName: string
  specification: string
  unit: string
  quantity: number
  safeStock: number
  minStock: number
  location: string
  lastInboundTime?: string
  lastOutboundTime?: string
}

export interface InventoryRecord {
  id: number
  partId: number
  partNo: string
  partName: string
  type: 'inbound' | 'outbound' | 'adjust'
  quantity: number
  balanceBefore: number
  balanceAfter: number
  operator?: string
  reason?: string
  orderNo?: string
  createTime: string
}

export interface WeatherForecast {
  id: number
  forecastDate: string
  temperature: number
  humidity: number
  rainfall: number
  rainfallIntensity: 'light' | 'moderate' | 'heavy' | 'storm'
  rainfall24h: number
  windSpeed: number
  tideLevel?: number
  updateTime: string
}

export interface PipelineNode {
  id: number
  code: string
  name: string
  type: 'pump' | 'manhole' | 'outfall' | 'reservoir'
  longitude: number
  latitude: number
  connectedNodes: number[]
  currentLevel?: number
  maxLevel: number
  warningLevel: number
}

export interface StatisticsData {
  pumpId?: number
  pumpName?: string
  basin?: string
  period: string
  totalDischarge: number
  totalRuntime: number
  totalPowerConsumption: number
  unitEnergyConsumption: number
  equipmentAvailability: number
  faultCount: number
  alertCount: number
  maintenanceCount: number
}

export interface User {
  id: number
  username: string
  name: string
  role: 'admin' | 'manager' | 'operator' | 'maintenance'
  permissions: string[]
}
