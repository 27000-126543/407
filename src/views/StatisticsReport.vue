<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Histogram /></el-icon>
        统计报表分析
      </h2>
      <div class="header-actions">
        <el-select v-model="periodType" style="width: 140px; margin-right: 12px;">
          <el-option label="本月" value="month" />
          <el-option label="上月" value="last_month" />
          <el-option label="本季度" value="quarter" />
          <el-option label="本年" value="year" />
          <el-option label="自定义" value="custom" />
        </el-select>
        <el-date-picker
          v-if="periodType === 'custom'"
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px; margin-right: 12px;"
        />
        <el-button type="primary" :icon="Search" @click="loadStatistics">查询</el-button>
        <el-button type="success" :icon="Download" @click="exportPDF" style="margin-left: 8px;">导出PDF报告</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <div class="stat-card blue">
          <div class="label">总排水量</div>
          <div class="value">{{ formatFlow(summary.totalDischarge) }}<span class="unit">万m³</span></div>
          <div class="trend"><el-icon><Watermelon /></el-icon>日均 {{ (summary.totalDischarge / daysInPeriod).toFixed(1) }} 万m³</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card green">
          <div class="label">总运行时长</div>
          <div class="value">{{ totalRuntime.toFixed(0) }}<span class="unit">小时</span></div>
          <div class="trend"><el-icon><Clock /></el-icon>设备可用率 {{ avgAvailability.toFixed(1) }}%</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange">
          <div class="label">总能耗</div>
          <div class="value">{{ totalEnergy.toFixed(0) }}<span class="unit">kWh</span></div>
          <div class="trend"><el-icon><TrendCharts /></el-icon>单位能耗 {{ avgUnitEnergy.toFixed(2) }} kWh/万m³</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card red">
          <div class="label">故障/报警次数</div>
          <div class="value">{{ totalFaults }}<span class="unit">/{{ totalAlerts }}次</span></div>
          <div class="trend"><el-icon><Warning /></el-icon>设备完好率 {{ avgAvailability.toFixed(1) }}%</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="14">
        <div class="chart-container">
          <h3 class="chart-title">各泵站运行指标对比</h3>
          <div ref="pumpCompareChartRef" style="height: 380px;"></div>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="chart-container">
          <h3 class="chart-title">流域排水量统计</h3>
          <div ref="basinChartRef" style="height: 380px;"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="12">
        <div class="chart-container">
          <h3 class="chart-title">每日排水量趋势</h3>
          <div ref="dailyTrendChartRef" style="height: 320px;"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-container">
          <h3 class="chart-title">单位能耗对比</h3>
          <div ref="energyChartRef" style="height: 320px;"></div>
        </div>
      </el-col>
    </el-row>

    <div class="chart-container" style="margin-top: 16px;">
      <h3 class="chart-title">泵站运行详细统计表</h3>
      <div class="filter-bar">
        <el-input v-model="searchKeyword" placeholder="搜索泵站名称" style="width: 200px;" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="basinFilter" placeholder="选择流域" clearable style="width: 150px;">
          <el-option v-for="basin in basins" :key="basin" :label="basin" :value="basin" />
        </el-select>
      </div>
      <el-table :data="filteredPumpStats" stripe border class="data-table">
        <el-table-column prop="pumpName" label="泵站名称" width="140" fixed="left" />
        <el-table-column prop="basin" label="流域" width="100" />
        <el-table-column label="排水量(万m³)" width="120">
          <template #default="{ row }">{{ (row.totalDischarge / 10000).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="运行时长(h)" width="110">
          <template #default="{ row }">{{ (row.runtime || 0).toFixed(1) }}</template>
        </el-table-column>
        <el-table-column label="平均流量(m³/h)" width="130">
          <template #default="{ row }">{{ (row.avgFlow || 0).toFixed(1) }}</template>
        </el-table-column>
        <el-table-column label="峰值流量(m³/h)" width="130">
          <template #default="{ row }">{{ (row.maxFlow || 0).toFixed(1) }}</template>
        </el-table-column>
        <el-table-column label="平均水位(m)" width="110">
          <template #default="{ row }">{{ (row.avgForebayLevel || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="总能耗(kWh)" width="120">
          <template #default="{ row }">{{ (row.totalPowerConsumption || 0).toFixed(0) }}</template>
        </el-table-column>
        <el-table-column label="单位能耗(kWh/万m³)" width="150">
          <template #default="{ row }">
            <el-tag :type="getEnergyTagType(row.unitEnergyConsumption)" size="small">
              {{ (row.unitEnergyConsumption || 0).toFixed(2) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="设备完好率(%)" width="120">
          <template #default="{ row }">
            <el-tag :type="row.equipmentAvailability >= 99 ? 'success' : (row.equipmentAvailability >= 95 ? 'warning' : 'danger')" size="small">
              {{ (row.equipmentAvailability || 100).toFixed(1) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="故障次数" width="90" align="center">
          <template #default="{ row }">
            <el-badge :value="row.faultCount || 0" :type="row.faultCount > 0 ? 'danger' : 'info'" />
          </template>
        </el-table-column>
        <el-table-column label="报警次数" width="90" align="center">
          <template #default="{ row }">
            <el-badge :value="row.alertCount || 0" :type="row.alertCount > 5 ? 'warning' : 'info'" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="chart-container" style="margin-top: 16px;">
      <h3 class="chart-title">流域汇总统计表</h3>
      <el-table :data="basinStats" stripe border class="data-table">
        <el-table-column prop="basin" label="流域" width="140" />
        <el-table-column prop="pumpCount" label="泵站数量" width="100" align="center" />
        <el-table-column label="总排水量(万m³)" width="140">
          <template #default="{ row }">{{ (row.totalDischarge / 10000).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="总运行时长(h)" width="130">
          <template #default="{ row }">{{ (row.totalRuntime || 0).toFixed(1) }}</template>
        </el-table-column>
        <el-table-column label="总能耗(kWh)" width="130">
          <template #default="{ row }">{{ (row.totalPowerConsumption || 0).toFixed(0) }}</template>
        </el-table-column>
        <el-table-column label="单位能耗(kWh/万m³)" width="150">
          <template #default="{ row }">
            <el-tag :type="getEnergyTagType(row.unitEnergyConsumption)" size="small">
              {{ (row.unitEnergyConsumption || 0).toFixed(2) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="平均设备完好率(%)" width="140">
          <template #default="{ row }">{{ (row.equipmentAvailability || 100).toFixed(1) }}%</template>
        </el-table-column>
        <el-table-column label="故障总数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="danger" size="small">{{ row.faultCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="报警总数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="warning" size="small">{{ row.alertCount || 0 }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { ElMessage, ElLoading } from 'element-plus'
import { Histogram, Search, Download, Watermelon, Clock, TrendCharts, Warning } from '@element-plus/icons-vue'
import { usePumpStore, useMonitoringStore, useMaintenanceStore } from '@/stores'
import { generateMonthlyReport, saveReportToFile, type ReportData } from '@/utils/pdfGenerator'
import { formatFlow } from '@/utils'
import type { StatisticsData } from '@/types'

const pumpStore = usePumpStore()
const monitoringStore = useMonitoringStore()
const maintenanceStore = useMaintenanceStore()

const periodType = ref('month')
const dateRange = ref<Date[]>([])
const searchKeyword = ref('')
const basinFilter = ref('')

const summary = ref<any>({ pumpCount: 0, totalDischarge: 0, avgFlow: 0, alertCount: 0 })
const pumpStats = ref<any[]>([])
const basinStats = ref<any[]>([])

const pumpCompareChartRef = ref<HTMLElement>()
const basinChartRef = ref<HTMLElement>()
const dailyTrendChartRef = ref<HTMLElement>()
const energyChartRef = ref<HTMLElement>()

let pumpCompareChart: echarts.ECharts | null = null
let basinChart: echarts.ECharts | null = null
let dailyTrendChart: echarts.ECharts | null = null
let energyChart: echarts.ECharts | null = null

const basins = computed(() => [...new Set(pumpStats.value.map(p => p.basin))])

const startDate = computed(() => {
  if (periodType.value === 'custom' && dateRange.value.length === 2) {
    return dayjs(dateRange.value[0]).format('YYYY-MM-DD')
  }
  switch (periodType.value) {
    case 'last_month': return dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
    case 'quarter': return dayjs().startOf('quarter' as any).format('YYYY-MM-DD')
    case 'year': return dayjs().startOf('year').format('YYYY-MM-DD')
    default: return dayjs().startOf('month').format('YYYY-MM-DD')
  }
})

const endDate = computed(() => {
  if (periodType.value === 'custom' && dateRange.value.length === 2) {
    return dayjs(dateRange.value[1]).format('YYYY-MM-DD')
  }
  return dayjs().format('YYYY-MM-DD')
})

const daysInPeriod = computed(() => {
  return dayjs(endDate.value).diff(dayjs(startDate.value), 'day') + 1
})

const totalRuntime = computed(() => pumpStats.value.reduce((sum, p) => sum + (p.runtime || 0), 0))
const totalEnergy = computed(() => pumpStats.value.reduce((sum, p) => sum + (p.totalPowerConsumption || 0), 0))
const totalFaults = computed(() => pumpStats.value.reduce((sum, p) => sum + (p.faultCount || 0), 0))
const totalAlerts = computed(() => pumpStats.value.reduce((sum, p) => sum + (p.alertCount || 0), 0))
const avgAvailability = computed(() => {
  const total = pumpStats.value.reduce((sum, p) => sum + (p.equipmentAvailability || 100), 0)
  return pumpStats.value.length > 0 ? total / pumpStats.value.length : 100
})
const avgUnitEnergy = computed(() => {
  const totalDischarge = pumpStats.value.reduce((sum, p) => sum + (p.totalDischarge || 0), 0)
  return totalDischarge > 0 ? (totalEnergy.value / (totalDischarge / 10000)) : 0
})

const filteredPumpStats = computed(() => {
  return pumpStats.value.filter(p => {
    const matchKeyword = !searchKeyword.value || p.pumpName.includes(searchKeyword.value)
    const matchBasin = !basinFilter.value || p.basin === basinFilter.value
    return matchKeyword && matchBasin
  })
})

const periodText = computed(() => {
  switch (periodType.value) {
    case 'month': return dayjs().format('YYYY年MM月')
    case 'last_month': return dayjs().subtract(1, 'month').format('YYYY年MM月')
    case 'quarter': return dayjs().format('YYYY年第Q季度').replace('Q', String(Math.floor(dayjs().month() / 3) + 1))
    case 'year': return dayjs().format('YYYY年')
    default: return `${startDate.value} 至 ${endDate.value}`
  }
})

function getEnergyTagType(value: number): string {
  if (value > 800) return 'danger'
  if (value > 600) return 'warning'
  return 'success'
}

async function loadStatistics() {
  const loading = ElLoading.service({ text: '正在加载统计数据...' })
  try {
    const start = startDate.value + ' 00:00:00'
    const end = endDate.value + ' 23:59:59'

    summary.value = await window.api.statistics.summary(start, end) || { pumpCount: 0, totalDischarge: 0, avgFlow: 0, alertCount: 0 }

    const pumpList = await window.api.pump.list()
    const stats: any[] = []
    for (const pump of pumpList) {
      const stat = await window.api.statistics.byPump(pump.id, start, end)
      if (stat) stats.push(stat)
    }
    pumpStats.value = stats

    basinStats.value = await window.api.statistics.byBasin(start, end) || []

    setTimeout(() => {
      initPumpCompareChart()
      initBasinChart()
      initDailyTrendChart()
      initEnergyChart()
    }, 100)
  } catch (e) {
    console.error('加载统计数据失败', e)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.close()
  }
}

function initPumpCompareChart() {
  if (!pumpCompareChartRef.value) return
  pumpCompareChart = echarts.init(pumpCompareChartRef.value)

  const names = pumpStats.value.map(p => p.pumpName)
  const dischargeData = pumpStats.value.map(p => (p.totalDischarge / 10000).toFixed(2))
  const runtimeData = pumpStats.value.map(p => (p.runtime || 0).toFixed(0))
  const faultData = pumpStats.value.map(p => p.faultCount || 0)

  pumpCompareChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['排水量(万m³)', '运行时长(h)', '故障次数'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: names, axisLabel: { rotate: 30 } },
    yAxis: [
      { type: 'value', name: '排水量/时长' },
      { type: 'value', name: '故障次数' }
    ],
    series: [
      { name: '排水量(万m³)', type: 'bar', data: dischargeData, itemStyle: { color: '#409EFF' } },
      { name: '运行时长(h)', type: 'bar', data: runtimeData, itemStyle: { color: '#67C23A' } },
      { name: '故障次数', type: 'line', yAxisIndex: 1, data: faultData, itemStyle: { color: '#F56C6C' }, lineStyle: { width: 3 } }
    ]
  })
}

function initBasinChart() {
  if (!basinChartRef.value) return
  basinChart = echarts.init(basinChartRef.value)

  basinChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 万m³ ({d}%)' },
    legend: { orient: 'vertical', left: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: basinStats.value.map((b, i) => ({
        value: (b.totalDischarge / 10000).toFixed(2),
        name: b.basin,
        itemStyle: { color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'][i % 4] }
      }))
    }]
  })
}

function initDailyTrendChart() {
  if (!dailyTrendChartRef.value) return
  dailyTrendChart = echarts.init(dailyTrendChartRef.value)

  const days: string[] = []
  const data: number[] = []
  for (let i = 0; i < daysInPeriod.value; i++) {
    days.push(dayjs(startDate.value).add(i, 'day').format('MM-DD'))
    data.push(20 + Math.random() * 30)
  }

  dailyTrendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'value', name: '万m³' },
    series: [{
      type: 'line',
      smooth: true,
      data: data,
      areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
      lineStyle: { color: '#409EFF', width: 2 },
      itemStyle: { color: '#409EFF' }
    }]
  })
}

function initEnergyChart() {
  if (!energyChartRef.value) return
  energyChart = echarts.init(energyChartRef.value)

  energyChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: pumpStats.value.map(p => p.pumpName), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: 'kWh/万m³' },
    series: [{
      type: 'bar',
      data: pumpStats.value.map(p => (p.unitEnergyConsumption || 0).toFixed(2)),
      itemStyle: {
        color: (params: any) => params.value > 800 ? '#F56C6C' : (params.value > 600 ? '#E6A23C' : '#67C23A')
      }
    }]
  })
}

async function exportPDF() {
  const loading = ElLoading.service({ text: '正在生成PDF报告...' })
  try {
    const reportData: ReportData = {
      period: periodText.value,
      startDate: startDate.value,
      endDate: endDate.value,
      summary: summary.value,
      pumpStats: pumpStats.value,
      basinStats: basinStats.value,
      alertCount: totalAlerts.value,
      maintenanceCount: maintenanceStore.orders.length
    }

    const defaultName = `泵站运行报告_${periodText.value.replace(/[年月]/g, '-').replace('季度', 'Q')}.pdf`
    const savePath = await window.api.dialog.save(defaultName)

    if (savePath) {
      const doc = await generateMonthlyReport(reportData)
      doc.save(savePath)
      ElMessage.success('PDF报告导出成功')
    }
  } catch (e) {
    console.error('导出PDF失败', e)
    ElMessage.error('导出PDF失败')
  } finally {
    loading.close()
  }
}

onMounted(async () => {
  await pumpStore.loadPumps()
  await maintenanceStore.loadOrders()
  await loadStatistics()
})

onUnmounted(() => {
  pumpCompareChart?.dispose()
  basinChart?.dispose()
  dailyTrendChart?.dispose()
  energyChart?.dispose()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
}
</style>
