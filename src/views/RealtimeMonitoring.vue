<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Monitor /></el-icon>
        实时运行监测
      </h2>
      <div class="header-actions">
        <el-select
          v-model="selectedPumpId"
          placeholder="选择泵站"
          style="width: 220px; margin-right: 12px;"
          @change="handlePumpChange"
        >
          <el-option
            v-for="pump in pumps"
            :key="pump.id"
            :label="pump.name"
            :value="pump.id"
          />
        </el-select>
        <el-tag :type="isAlert ? 'danger' : 'success'" class="status-tag">
          <el-icon v-if="isAlert"><WarningFilled /></el-icon>
          <el-icon v-else><CircleCheckFilled /></el-icon>
          {{ isAlert ? '存在报警' : '运行正常' }}
        </el-tag>
      </div>
    </div>

    <el-row :gutter="16" class="data-cards-row">
      <el-col :span="3" v-for="card in dataCards" :key="card.key">
        <div
          class="data-card"
          :class="{ 'alert-card': card.isAlert, 'danger-card': card.isDanger }"
        >
          <div class="card-icon" :style="{ background: card.color }">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">{{ card.label }}</div>
            <div class="card-value">
              {{ card.value }}
              <span class="card-unit">{{ card.unit }}</span>
            </div>
            <div class="card-range">阈值: {{ card.threshold }}</div>
          </div>
          <el-icon v-if="card.isAlert" class="alert-icon"><WarningFilled /></el-icon>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="16">
        <div class="chart-container">
          <h3 class="chart-title">
            24小时历史趋势
            <el-radio-group v-model="trendType" size="small" style="margin-left: 16px;">
              <el-radio-button value="flow">流量</el-radio-button>
              <el-radio-button value="current">电流</el-radio-button>
              <el-radio-button value="level">水位</el-radio-button>
            </el-radio-group>
          </h3>
          <div ref="trendChartRef" style="height: 380px;"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-container">
          <h3 class="chart-title">泵组运行状态</h3>
          <div class="pump-units-list">
            <div
              v-for="unit in pumpUnits"
              :key="unit.id"
              class="pump-unit-card"
              :class="`status-${unit.status}`"
            >
              <div class="unit-header">
                <span class="unit-name">{{ unit.unitNumber }}泵</span>
                <el-tag :type="getUnitStatusType(unit.status)" size="small">
                  {{ getStatusText(unit.status) }}
                </el-tag>
              </div>
              <div class="unit-info">
                <div class="info-item">
                  <span class="info-label">电流</span>
                  <span class="info-value">{{ unit.current?.toFixed(1) || '--' }} A</span>
                </div>
                <div class="info-item">
                  <span class="info-label">流量</span>
                  <span class="info-value">{{ unit.flow?.toFixed(0) || '--' }} m³/h</span>
                </div>
                <div class="info-item">
                  <span class="info-label">扬程</span>
                  <span class="info-value">{{ unit.head?.toFixed(1) || '--' }} m</span>
                </div>
                <div class="info-item">
                  <span class="info-label">运行时间</span>
                  <span class="info-value">{{ formatRuntime(unit.runtime) }}</span>
                </div>
              </div>
              <div class="unit-actions" v-if="unit.isBackup && unit.status === 'standby'">
                <el-button type="primary" size="small" @click="startBackupPump(unit)">
                  启动备用泵
                </el-button>
              </div>
              <div class="unit-actions" v-if="unit.status === 'running'">
                <el-button type="danger" size="small" @click="stopPump(unit)">
                  停止运行
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      v-model="alertDialogVisible"
      title="报警提示"
      width="500px"
      :close-on-click-modal="false"
      class="alert-dialog"
    >
      <div class="alert-content">
        <el-alert
          :title="currentAlert?.message || ''"
          :type="getAlertLevelType(currentAlert?.alertLevel || 'warning')"
          :closable="false"
          show-icon
        >
          <template #default>
            <div class="alert-details">
              <p><strong>报警时间：</strong>{{ formatDateTime(currentAlert?.timestamp || '') }}</p>
              <p><strong>报警参数：</strong>{{ currentAlert?.parameter }}</p>
              <p><strong>实际值：</strong>{{ currentAlert?.actualValue }}</p>
              <p><strong>阈值：</strong>{{ currentAlert?.threshold }}</p>
            </div>
          </template>
        </el-alert>
      </div>
      <template #footer>
        <el-button @click="acknowledgeAlert">确认报警</el-button>
        <el-button type="primary" @click="viewAlertCenter">前往报警中心</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import {
  Monitor, WarningFilled, CircleCheckFilled,
  Lightning, Cpu, Pouring, TrendCharts,
  Location, Position, Odometer, HotWater
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePumpStore, useMonitoringStore } from '@/stores'
import {
  formatDateTime, formatNumber, getStatusText,
  getAlertLevelText, getAlertLevelType, playAlertSound
} from '@/utils'
import type { Pump, MonitoringData, Alert, PumpUnit } from '@/types'

const router = useRouter()
const pumpStore = usePumpStore()
const monitoringStore = useMonitoringStore()

const selectedPumpId = ref<number | null>(null)
const trendType = ref<'flow' | 'current' | 'level'>('flow')
const trendChartRef = ref<HTMLElement>()
const alertDialogVisible = ref(false)
const currentAlert = ref<Alert | null>(null)
const lastAlertId = ref<number | null>(null)

let trendChart: echarts.ECharts | null = null
let dataInterval: number | null = null

const pumps = computed<Pump[]>(() => pumpStore.pumps)

const currentPump = computed<Pump | null>(() => {
  if (!selectedPumpId.value) return null
  return pumps.value.find(p => p.id === selectedPumpId.value) || null
})

const realtimeData = computed<MonitoringData | null>(() => {
  if (!selectedPumpId.value) return null
  return monitoringStore.realtimeData.get(selectedPumpId.value) || null
})

const isAlert = computed(() => realtimeData.value?.isAlert || false)

const pumpUnits = computed<PumpUnit[]>(() => {
  if (!currentPump.value) return []
  return currentPump.value.units || []
})

const historyData = ref<{ time: string; flow: number; current: number; level: number }[]>([])

const dataCards = computed(() => {
  const data = realtimeData.value
  const pump = currentPump.value
  if (!data || !pump) return []

  const cards = [
    {
      key: 'current',
      label: '电流',
      value: formatNumber(data.current, 1),
      unit: 'A',
      threshold: `≤ ${pump.maxCurrent} A`,
      icon: Lightning,
      color: '#409EFF',
      isAlert: data.current > pump.maxCurrent,
      isDanger: data.current > pump.maxCurrent * 1.1
    },
    {
      key: 'voltage',
      label: '电压',
      value: formatNumber(data.voltage, 1),
      unit: 'V',
      threshold: '380 ± 10% V',
      icon: Cpu,
      color: '#67C23A',
      isAlert: data.voltage < 342 || data.voltage > 418,
      isDanger: data.voltage < 323 || data.voltage > 437
    },
    {
      key: 'flow',
      label: '流量',
      value: formatNumber(data.flow, 0),
      unit: 'm³/h',
      threshold: `≤ ${pump.designFlow} m³/h`,
      icon: Pouring,
      color: '#409EFF',
      isAlert: data.flow > pump.designFlow,
      isDanger: data.flow > pump.designFlow * 1.2
    },
    {
      key: 'head',
      label: '扬程',
      value: formatNumber(data.head, 1),
      unit: 'm',
      threshold: `≤ ${pump.head} m`,
      icon: TrendCharts,
      color: '#E6A23C',
      isAlert: data.head > pump.head,
      isDanger: data.head > pump.head * 1.15
    },
    {
      key: 'forebayLevel',
      label: '前池水位',
      value: formatNumber(data.forebayLevel, 2),
      unit: 'm',
      threshold: `预警 ${pump.forebayWarningLevel}m / 危险 ${pump.forebayDangerLevel}m`,
      icon: Location,
      color: '#409EFF',
      isAlert: data.forebayLevel >= pump.forebayWarningLevel,
      isDanger: data.forebayLevel >= pump.forebayDangerLevel
    },
    {
      key: 'outletPressure',
      label: '出口压力',
      value: formatNumber(data.outletPressure, 2),
      unit: 'MPa',
      threshold: '≤ 0.6 MPa',
      icon: Position,
      color: '#F56C6C',
      isAlert: data.outletPressure > 0.6,
      isDanger: data.outletPressure > 0.7
    },
    {
      key: 'vibration',
      label: '振动',
      value: formatNumber(data.vibration, 2),
      unit: 'mm/s',
      threshold: '≤ 4.5 mm/s',
      icon: Odometer,
      color: '#909399',
      isAlert: data.vibration > 4.5,
      isDanger: data.vibration > 7.1
    },
    {
      key: 'temperature',
      label: '温度',
      value: formatNumber(data.temperature, 1),
      unit: '°C',
      threshold: '≤ 85 °C',
      icon: HotWater,
      color: '#F56C6C',
      isAlert: data.temperature > 85,
      isDanger: data.temperature > 95
    }
  ]

  return cards
})

function getUnitStatusType(status: string): string {
  const map: Record<string, string> = {
    running: 'success',
    standby: 'info',
    fault: 'danger'
  }
  return map[status] || 'info'
}

function formatRuntime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function handlePumpChange() {
  generateHistoryData()
  nextTick(() => {
    initTrendChart()
  })
}

function generateHistoryData() {
  const now = dayjs()
  historyData.value = Array.from({ length: 24 }, (_, i) => {
    const time = now.subtract(23 - i, 'hour')
    const baseFlow = currentPump.value ? currentPump.value.designFlow * 0.6 : 500
    const baseCurrent = 70
    const baseLevel = 2.5
    return {
      time: time.format('HH:00'),
      flow: baseFlow + Math.random() * baseFlow * 0.5,
      current: baseCurrent + Math.random() * 30,
      level: baseLevel + Math.random() * 1.5
    }
  })
}

function initTrendChart() {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  updateTrendChart()
}

function updateTrendChart() {
  if (!trendChart) return

  const xData = historyData.value.map(d => d.time)
  let yData: number[]
  let name: string
  let unit: string
  let color: string
  let warningLine: number | undefined
  let dangerLine: number | undefined

  const pump = currentPump.value

  switch (trendType.value) {
    case 'flow':
      yData = historyData.value.map(d => d.flow)
      name = '流量'
      unit = 'm³/h'
      color = '#409EFF'
      if (pump) {
        warningLine = pump.designFlow
        dangerLine = pump.designFlow * 1.2
      }
      break
    case 'current':
      yData = historyData.value.map(d => d.current)
      name = '电流'
      unit = 'A'
      color = '#E6A23C'
      if (pump) {
        warningLine = pump.maxCurrent
        dangerLine = pump.maxCurrent * 1.1
      }
      break
    case 'level':
      yData = historyData.value.map(d => d.level)
      name = '前池水位'
      unit = 'm'
      color = '#67C23A'
      if (pump) {
        warningLine = pump.forebayWarningLevel
        dangerLine = pump.forebayDangerLevel
      }
      break
  }

  const markLines: any[] = []
  if (warningLine !== undefined) {
    markLines.push({
      yAxis: warningLine,
      lineStyle: { color: '#E6A23C', type: 'dashed' },
      label: { formatter: `预警: ${warningLine}`, color: '#E6A23C' }
    })
  }
  if (dangerLine !== undefined) {
    markLines.push({
      yAxis: dangerLine,
      lineStyle: { color: '#F56C6C', type: 'dashed' },
      label: { formatter: `危险: ${dangerLine}`, color: '#F56C6C' }
    })
  }

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0]
        return `${p.axisValue}<br/>${name}: ${p.value.toFixed(1)} ${unit}`
      }
    },
    legend: {
      data: [name],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData
    },
    yAxis: {
      type: 'value',
      name: unit
    },
    series: [{
      name,
      type: 'line',
      smooth: true,
      showSymbol: false,
      sampling: 'lttb',
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: color.replace(')', ', 0.5)').replace('rgb', 'rgba') },
          { offset: 1, color: color.replace(')', ', 0.05)').replace('rgb', 'rgba') }
        ])
      },
      lineStyle: { color, width: 2 },
      itemStyle: { color },
      data: yData,
      markLine: {
        silent: true,
        symbol: 'none',
        data: markLines
      }
    }]
  })
}

function updateRealtimeData() {
  if (!selectedPumpId.value) return

  const pump = currentPump.value
  if (!pump) return

  const baseData: MonitoringData = {
    id: Date.now(),
    pumpId: selectedPumpId.value,
    timestamp: new Date().toISOString(),
    current: 75 + Math.random() * 20,
    voltage: 380 + Math.random() * 10 - 5,
    flow: pump.designFlow * 0.6 + Math.random() * pump.designFlow * 0.3,
    head: pump.head * 0.85 + Math.random() * pump.head * 0.2,
    forebayLevel: 2.0 + Math.random() * 1.8,
    outletPressure: 0.2 + Math.random() * 0.25,
    vibration: 1.5 + Math.random() * 2.5,
    temperature: 60 + Math.random() * 15,
    isAlert: false
  }

  if (Math.random() < 0.1) {
    baseData.current = pump.maxCurrent * 1.05 + Math.random() * 10
    baseData.isAlert = true
    baseData.alertLevel = 'warning'
  }
  if (Math.random() < 0.05) {
    baseData.forebayLevel = pump.forebayWarningLevel + Math.random() * 0.5
    baseData.isAlert = true
    baseData.alertLevel = 'danger'
  }

  monitoringStore.realtimeData.set(selectedPumpId.value, baseData)

  if (baseData.isAlert && baseData.alertLevel) {
    checkAndShowAlert(baseData, pump)
  }

  updatePumpUnitsData()

  if (historyData.value.length > 0) {
    const lastHour = dayjs().format('HH:00')
    const lastEntry = historyData.value[historyData.value.length - 1]
    if (lastEntry.time === lastHour) {
      lastEntry.flow = (lastEntry.flow * 0.9 + baseData.flow * 0.1)
      lastEntry.current = (lastEntry.current * 0.9 + baseData.current * 0.1)
      lastEntry.level = (lastEntry.level * 0.9 + baseData.forebayLevel * 0.1)
    }
    updateTrendChart()
  }
}

function updatePumpUnitsData() {
  const units = currentPump.value?.units
  if (!units) return
  units.forEach(unit => {
    if (unit.status === 'running') {
      unit.current = (unit.ratedCurrent || 100) * (0.85 + Math.random() * 0.1)
      unit.flow = (unit.ratedFlow || 500) * (0.85 + Math.random() * 0.15)
      unit.head = (unit.ratedHead || 18) * (0.95 + Math.random() * 0.1)
      unit.runtime = (unit.runtime || 0) + 5
    }
  })
}

async function checkAndShowAlert(data: MonitoringData, pump: Pump) {
  let alertType = ''
  let parameter = ''
  let actualValue = 0
  let threshold = 0
  let message = ''
  let isDanger = false
  let autoAction = ''
  let autoActionResult = ''

  if (data.current > pump.maxCurrent) {
    alertType = '电流超限'
    parameter = '电流'
    actualValue = data.current
    threshold = pump.maxCurrent
    message = `${pump.name} 电流超过额定值，当前 ${data.current.toFixed(1)}A，额定 ${pump.maxCurrent}A`
    isDanger = data.alertLevel === 'danger'
  } else if (data.forebayLevel >= pump.forebayWarningLevel) {
    isDanger = data.forebayLevel >= pump.forebayDangerLevel
    alertType = '水位超限'
    parameter = '前池水位'
    actualValue = data.forebayLevel
    threshold = isDanger ? pump.forebayDangerLevel : pump.forebayWarningLevel
    message = `${pump.name} 前池水位${isDanger ? '达到危险值' : '超过预警值'}，当前 ${data.forebayLevel.toFixed(2)}m`

    if (isDanger && pump.units) {
      const backupUnit = pump.units.find(u => u.isBackup && u.status !== 'fault')
      if (backupUnit && backupUnit.status !== 'running') {
        backupUnit.status = 'running'
        backupUnit.current = (backupUnit.ratedCurrent || 100) * 0.9
        backupUnit.flow = (backupUnit.ratedFlow || 500) * 0.85
        backupUnit.head = backupUnit.ratedHead || 18
        autoAction = `自动启动备用泵 ${backupUnit.unitNumber}`
        autoActionResult = `备用泵 ${backupUnit.unitNumber} 启动成功，流量 ${(backupUnit.flow || 0).toFixed(0)}m³/h`
        message += `；已${autoAction}`
      } else {
        autoAction = '尝试启动备用泵'
        autoActionResult = '无可运行备用泵'
      }
    }
  }

  const alert: Alert = {
    id: Date.now(),
    pumpId: pump.id,
    alertType,
    alertLevel: isDanger ? 'danger' : 'warning',
    parameter,
    actualValue,
    threshold,
    message,
    timestamp: data.timestamp,
    acknowledged: false,
    autoAction: autoAction || undefined,
    autoActionResult: autoActionResult || undefined
  }

  if (alert.id !== lastAlertId.value) {
    currentAlert.value = alert
    alertDialogVisible.value = true
    lastAlertId.value = alert.id
    playAlertSound(alert.alertLevel)

    try {
      await monitoringStore.insertAlert(alert)
    } catch (e) {
      console.error('保存报警失败', e)
    }

    if (autoAction) {
      ElMessage.warning(autoActionResult || autoAction)
    }
  }
}

async function startBackupPump(unit: PumpUnit) {
  try {
    await ElMessageBox.confirm(
      `确定要启动 ${unit.unitNumber}# 备用泵吗？`,
      '启动确认',
      { type: 'warning' }
    )
    unit.status = 'running'
    unit.current = 60 + Math.random() * 20
    unit.flow = 500 + Math.random() * 200
    unit.head = 16 + Math.random() * 3
    ElMessage.success(`${unit.unitNumber}# 备用泵已启动`)
  } catch {
    // user cancelled
  }
}

async function stopPump(unit: PumpUnit) {
  try {
    await ElMessageBox.confirm(
      `确定要停止 ${unit.unitNumber}# 泵吗？`,
      '停止确认',
      { type: 'warning' }
    )
    unit.status = 'standby'
    unit.current = undefined
    unit.flow = undefined
    unit.head = undefined
    ElMessage.success(`${unit.unitNumber}# 泵已停止`)
  } catch {
    // user cancelled
  }
}

function acknowledgeAlert() {
  if (currentAlert.value) {
    monitoringStore.ackAlert(currentAlert.value.id, '当前用户')
    alertDialogVisible.value = false
    currentAlert.value = null
    ElMessage.success('报警已确认')
  }
}

function viewAlertCenter() {
  alertDialogVisible.value = false
  router.push('/alerts')
}

watch(trendType, () => {
  updateTrendChart()
})

async function init() {
  await pumpStore.loadPumps()
  await monitoringStore.loadAlerts()

  if (pumps.value.length > 0) {
    selectedPumpId.value = pumps.value[0].id
    generateHistoryData()
    await monitoringStore.loadRealtime(selectedPumpId.value)

    nextTick(() => {
      initTrendChart()
      updateRealtimeData()
    })

    dataInterval = window.setInterval(updateRealtimeData, 5000)
  }
}

onMounted(init)

onUnmounted(() => {
  if (dataInterval) clearInterval(dataInterval)
  trendChart?.dispose()
})
</script>

<style scoped>
.data-cards-row {
  margin-bottom: 8px;
}

.data-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.data-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.data-card.alert-card {
  border-color: #E6A23C;
  background: linear-gradient(135deg, #fff 0%, #fdf6ec 100%);
}

.data-card.danger-card {
  border-color: #F56C6C;
  background: linear-gradient(135deg, #fff 0%, #fef0f0 100%);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.card-value {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.card-unit {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
  margin-left: 4px;
}

.card-range {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 4px;
}

.alert-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #F56C6C;
  font-size: 18px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pump-units-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pump-unit-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s;
}

.pump-unit-card.status-running {
  border-left: 4px solid #67C23A;
  background: linear-gradient(90deg, #f0f9eb 0%, #fff 100%);
}

.pump-unit-card.status-standby {
  border-left: 4px solid #909399;
  background: linear-gradient(90deg, #f4f4f5 0%, #fff 100%);
}

.pump-unit-card.status-fault {
  border-left: 4px solid #F56C6C;
  background: linear-gradient(90deg, #fef0f0 0%, #fff 100%);
}

.unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.unit-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.unit-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.info-label {
  color: #909399;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.unit-actions {
  text-align: right;
  padding-top: 8px;
  border-top: 1px dashed #ebeef5;
}

.alert-details {
  margin-top: 12px;
}

.alert-details p {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
}
</style>
