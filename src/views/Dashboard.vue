<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><DataAnalysis /></el-icon>
        运行总览
      </h2>
      <div class="date-display">
        <el-tag type="info">{{ currentTime }}</el-tag>
      </div>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="4">
        <div class="stat-card blue">
          <div class="label">运行泵站</div>
          <div class="value">{{ runningPumps }}<span class="unit">/ {{ totalPumps }} 座</span></div>
          <div class="trend"><el-icon><TrendCharts /></el-icon>在线率 {{ availability }}%</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card green">
          <div class="label">今日排水量</div>
          <div class="value">{{ formatFlow(todayDischarge) }}<span class="unit">m³</span></div>
          <div class="trend"><el-icon><Top /></el-icon>较昨日 +12.5%</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card orange">
          <div class="label">今日能耗</div>
          <div class="value">{{ todayEnergy.toFixed(0) }}<span class="unit">kWh</span></div>
          <div class="trend"><el-icon><Bottom /></el-icon>单位能耗 {{ unitEnergy.toFixed(2) }}kWh/万m³</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card">
          <div class="label">待审批方案</div>
          <div class="value">{{ pendingSchedules }}<span class="unit">份</span></div>
          <div class="trend"><el-icon><Clock /></el-icon>今日待执行 {{ todaySchedulesCount }} 份</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card" :class="unacknowledgedAlerts > 0 ? 'red' : ''">
          <div class="label">未处理报警</div>
          <div class="value">{{ unacknowledgedAlerts }}<span class="unit">条</span></div>
          <div class="trend"><el-icon><Warning /></el-icon>危急 {{ criticalAlerts }} 条</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card">
          <div class="label">待处理维保</div>
          <div class="value">{{ pendingMaintenance }}<span class="unit">单</span></div>
          <div class="trend"><el-icon><Tools /></el-icon>低库存备件 {{ lowStockItems }} 项</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="14">
        <div class="chart-container">
          <h3 class="chart-title">24小时排水流量趋势</h3>
          <div ref="flowChartRef" style="height: 320px;"></div>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="chart-container">
          <h3 class="chart-title">各流域排水量占比</h3>
          <div ref="basinChartRef" style="height: 320px;"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="12">
        <div class="chart-container">
          <h3 class="chart-title">泵站运行状态</h3>
          <el-table :data="pumps" size="small" stripe class="data-table">
            <el-table-column prop="name" label="泵站名称" width="140" />
            <el-table-column prop="basin" label="流域" width="100" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <span :class="getStatusClass(row.status)">{{ getStatusText(row.status) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="当前流量" width="100">
              <template #default="{ row }">
                {{ getCurrentFlow(row.id)?.toFixed(0) || 0 }} m³/h
              </template>
            </el-table-column>
            <el-table-column label="前池水位" width="100">
              <template #default="{ row }">
                <span :style="{ color: getLevelColor(getCurrentLevel(row.id) || 0, row.forebayDangerLevel, row.forebayWarningLevel) }">
                  {{ getCurrentLevel(row.id)?.toFixed(2) || 0 }} m
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="designFlow" label="设计流量" width="100">
              <template #default="{ row }">{{ row.designFlow }} m³/h</template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-container">
          <h3 class="chart-title">今日调度方案</h3>
          <el-table :data="todaySchedules" size="small" stripe class="data-table">
            <el-table-column prop="pumpName" label="泵站名称" width="140" />
            <el-table-column label="运行时间" width="140">
              <template #default="{ row }">
                {{ row.planStartTime }} - {{ row.planEndTime }}
              </template>
            </el-table-column>
            <el-table-column prop="plannedFlow" label="计划流量" width="100">
              <template #default="{ row }">{{ row.plannedFlow }} m³/h</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getScheduleStatusType(row.status)" size="small">
                  {{ getScheduleStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="viewSchedule(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="24">
        <div class="chart-container">
          <h3 class="chart-title">7日天气预报</h3>
          <div ref="weatherChartRef" style="height: 240px;"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { Clock, Warning, Tools, TrendCharts, Top, Bottom, DataAnalysis } from '@element-plus/icons-vue'
import { usePumpStore, useScheduleStore, useMonitoringStore, useMaintenanceStore, useInventoryStore, useWeatherStore } from '@/stores'
import { getStatusText, getScheduleStatusText, getScheduleStatusType, getLevelColor, formatFlow } from '@/utils'

const router = useRouter()
const pumpStore = usePumpStore()
const scheduleStore = useScheduleStore()
const monitoringStore = useMonitoringStore()
const maintenanceStore = useMaintenanceStore()
const inventoryStore = useInventoryStore()
const weatherStore = useWeatherStore()

const currentTime = ref('')
const flowChartRef = ref<HTMLElement>()
const basinChartRef = ref<HTMLElement>()
const weatherChartRef = ref<HTMLElement>()

let flowChart: echarts.ECharts | null = null
let basinChart: echarts.ECharts | null = null
let weatherChart: echarts.ECharts | null = null
let timeInterval: number | null = null

const pumps = computed(() => pumpStore.pumps)
const totalPumps = computed(() => pumps.value.length)
const runningPumps = computed(() => pumps.value.filter(p => p.status === 'running').length)
const availability = computed(() => totalPumps.value > 0 ? ((runningPumps.value / totalPumps.value) * 100).toFixed(1) : '0')

const schedules = computed(() => scheduleStore.schedules)
const pendingSchedules = computed(() => scheduleStore.pendingApproval.length)
const todaySchedules = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return schedules.value.filter(s => s.scheduleDate === today).slice(0, 5)
})
const todaySchedulesCount = computed(() => todaySchedules.value.length)

const alerts = computed(() => monitoringStore.alerts)
const unacknowledgedAlerts = computed(() => alerts.value.filter(a => !a.acknowledged).length)
const criticalAlerts = computed(() => alerts.value.filter(a => !a.acknowledged && a.alertLevel === 'critical').length)

const pendingMaintenance = computed(() => maintenanceStore.pendingOrders.length)
const lowStockItems = computed(() => inventoryStore.lowStockItems.length)

const todayDischarge = ref(125680)
const todayEnergy = ref(8560)
const unitEnergy = computed(() => todayDischarge.value > 0 ? (todayEnergy.value / (todayDischarge.value / 10000)) : 0)

const realtimeData = ref<Map<number, { flow: number; level: number }>>(new Map())

function getStatusClass(status: string): string {
  return `status-tag-${status}`
}

function getCurrentFlow(pumpId: number): number | undefined {
  return realtimeData.value.get(pumpId)?.flow
}

function getCurrentLevel(pumpId: number): number | undefined {
  return realtimeData.value.get(pumpId)?.level
}

function updateCurrentTime() {
  currentTime.value = dayjs().format('YYYY年MM月DD日 HH:mm:ss')
}

async function loadRealtimeData() {
  for (const pump of pumps.value) {
    const data = await monitoringStore.loadRealtime(pump.id)
    if (data) {
      realtimeData.value.set(pump.id, {
        flow: data.flow || 0,
        level: data.forebayLevel || 0
      })
    }
  }
}

function initFlowChart() {
  if (!flowChartRef.value) return
  flowChart = echarts.init(flowChartRef.value)

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  const flowData = hours.map(() => 400 + Math.random() * 600)

  flowChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>流量: {c} m³/h'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours
    },
    yAxis: {
      type: 'value',
      name: 'm³/h'
    },
    series: [{
      name: '排水流量',
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      },
      lineStyle: {
        color: '#409EFF',
        width: 2
      },
      itemStyle: { color: '#409EFF' },
      data: flowData
    }]
  })
}

function initBasinChart() {
  if (!basinChartRef.value) return
  basinChart = echarts.init(basinChartRef.value)

  basinChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 万m³ ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 68.5, name: '东湖流域', itemStyle: { color: '#409EFF' } },
        { value: 57.2, name: '西湖流域', itemStyle: { color: '#67C23A' } }
      ]
    }]
  })
}

function initWeatherChart() {
  if (!weatherChartRef.value) return
  weatherChart = echarts.init(weatherChartRef.value)

  const dates = weatherStore.forecast.map(w => dayjs(w.forecastDate).format('MM-DD'))
  const rainfall = weatherStore.forecast.map(w => w.rainfall)
  const temperature = weatherStore.forecast.map(w => w.temperature)

  weatherChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['降雨量', '气温']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '降雨量(mm)',
        position: 'left'
      },
      {
        type: 'value',
        name: '气温(°C)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '降雨量',
        type: 'bar',
        data: rainfall,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#79BBFF' }
          ])
        }
      },
      {
        name: '气温',
        type: 'line',
        yAxisIndex: 1,
        data: temperature,
        smooth: true,
        lineStyle: { color: '#F56C6C', width: 2 },
        itemStyle: { color: '#F56C6C' }
      }
    ]
  })
}

function viewSchedule(row: any) {
  router.push('/schedules')
}

async function init() {
  await pumpStore.loadPumps()
  await scheduleStore.loadSchedules()
  await monitoringStore.loadAlerts()
  await maintenanceStore.loadOrders()
  await inventoryStore.loadItems()
  await weatherStore.loadForecast()
  await loadRealtimeData()

  updateCurrentTime()
  timeInterval = window.setInterval(updateCurrentTime, 1000)

  setTimeout(() => {
    initFlowChart()
    initBasinChart()
    initWeatherChart()
  }, 100)
}

onMounted(init)

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  flowChart?.dispose()
  basinChart?.dispose()
  weatherChart?.dispose()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 8px;
}
</style>
