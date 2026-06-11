<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><BellFilled /></el-icon>
        报警事件中心
      </h2>
      <div class="header-actions">
        <el-button @click="exportAlerts">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button type="primary" @click="loadAlerts">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <div class="stat-card red">
          <div class="stat-icon">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">紧急报警</div>
            <div class="stat-value">{{ criticalCount }}</div>
            <div class="stat-sub">未确认 {{ unackCriticalCount }} 条</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange">
          <div class="stat-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">危险报警</div>
            <div class="stat-value">{{ dangerCount }}</div>
            <div class="stat-sub">未确认 {{ unackDangerCount }} 条</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card yellow">
          <div class="stat-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">预警信息</div>
            <div class="stat-value">{{ warningCount }}</div>
            <div class="stat-sub">未确认 {{ unackWarningCount }} 条</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><CircleCheckFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">已确认</div>
            <div class="stat-value">{{ acknowledgedCount }}</div>
            <div class="stat-sub">共 {{ totalCount }} 条报警</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="16">
        <div class="chart-container">
          <div class="filter-bar">
            <div class="filter-left">
              <el-select
                v-model="filterPumpId"
                placeholder="泵站"
                clearable
                size="default"
                style="width: 140px;"
              >
                <el-option
                  v-for="p in pumpStore.pumps"
                  :key="p.id"
                  :label="p.name"
                  :value="p.id"
                />
              </el-select>
              <el-select
                v-model="filterAlertType"
                placeholder="报警类型"
                clearable
                size="default"
                style="width: 120px;"
              >
                <el-option label="电流超限" value="电流超限" />
                <el-option label="水位超限" value="水位超限" />
                <el-option label="电压异常" value="电压异常" />
                <el-option label="流量超限" value="流量超限" />
                <el-option label="压力异常" value="压力异常" />
                <el-option label="振动超限" value="振动超限" />
                <el-option label="温度过高" value="温度过高" />
              </el-select>
              <el-select
                v-model="filterLevel"
                placeholder="报警级别"
                clearable
                size="default"
                style="width: 110px;"
              >
                <el-option label="紧急" value="critical" />
                <el-option label="危险" value="danger" />
                <el-option label="预警" value="warning" />
              </el-select>
              <el-select
                v-model="filterStatus"
                placeholder="确认状态"
                clearable
                size="default"
                style="width: 110px;"
              >
                <el-option label="未确认" :value="false" />
                <el-option label="已确认" :value="true" />
              </el-select>
              <el-select
                v-model="filterDisposal"
                placeholder="处置状态"
                clearable
                size="default"
                style="width: 110px;"
              >
                <el-option label="待处置" value="pending" />
                <el-option label="处置中" value="in_progress" />
                <el-option label="已完成" value="completed" />
              </el-select>
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                size="default"
                style="width: 340px;"
              />
            </div>
            <div class="filter-right">
              <el-button
                type="primary"
                :disabled="selectedAlerts.length === 0"
                @click="batchAcknowledge"
              >
                批量确认 ({{ selectedAlerts.length }})
              </el-button>
            </div>
          </div>

          <el-table
            ref="tableRef"
            :data="paginatedAlerts"
            style="width: 100%; margin-top: 12px;"
            stripe
            @selection-change="handleSelectionChange"
            class="alert-table"
          >
            <el-table-column type="selection" width="48" />
            <el-table-column prop="timestamp" label="时间" width="155">
              <template #default="{ row }">
                {{ formatDateTime(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column label="泵站" width="110">
              <template #default="{ row }">
                {{ getPumpName(row.pumpId) }}
              </template>
            </el-table-column>
            <el-table-column prop="alertType" label="报警类型" width="100" />
            <el-table-column label="级别" width="70">
              <template #default="{ row }">
                <el-tag :type="getAlertLevelType(row.alertLevel)" size="small">
                  {{ getAlertLevelText(row.alertLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="实际值" width="85">
              <template #default="{ row }">
                <span class="actual-value">{{ row.actualValue?.toFixed(2) ?? '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="阈值" width="85">
              <template #default="{ row }">
                <span class="threshold-value">{{ row.threshold?.toFixed(2) ?? '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="确认" width="70">
              <template #default="{ row }">
                <el-tag :type="row.acknowledged ? 'success' : 'warning'" size="small">
                  {{ row.acknowledged ? '已确认' : '未确认' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="处置" width="70">
              <template #default="{ row }">
                <el-tag :type="getDisposalTagType(row)" size="small">
                  {{ getDisposalStatusText(row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="130" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewDetail(row)">
                  详情
                </el-button>
                <el-button
                  type="success"
                  link
                  size="small"
                  :disabled="row.acknowledged"
                  @click="acknowledge(row)"
                >
                  确认
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="filteredAlerts.length"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-container">
          <h3 class="chart-title">报警级别分布</h3>
          <div ref="levelChartRef" style="height: 280px;"></div>
        </div>
        <div class="chart-container" style="margin-top: 16px;">
          <h3 class="chart-title">报警类型分布</h3>
          <div ref="typeChartRef" style="height: 280px;"></div>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      v-model="detailDialogVisible"
      title="报警详情"
      width="720px"
      class="detail-dialog"
      @close="disposalRecords = []"
    >
      <el-descriptions :column="2" border v-if="currentAlert">
        <el-descriptions-item label="报警时间">
          {{ formatDateTime(currentAlert.timestamp) }}
        </el-descriptions-item>
        <el-descriptions-item label="报警级别">
          <el-tag :type="getAlertLevelType(currentAlert.alertLevel)">
            {{ getAlertLevelText(currentAlert.alertLevel) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="泵站名称">
          {{ getPumpName(currentAlert.pumpId) }}
        </el-descriptions-item>
        <el-descriptions-item label="报警类型">
          {{ currentAlert.alertType }}
        </el-descriptions-item>
        <el-descriptions-item label="报警参数">
          {{ currentAlert.parameter }}
        </el-descriptions-item>
        <el-descriptions-item label="实际值">
          <span class="highlight-value">{{ currentAlert.actualValue?.toFixed(2) ?? '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="阈值">
          <span class="threshold-value">{{ currentAlert.threshold?.toFixed(2) ?? '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="确认状态">
          <el-tag :type="currentAlert.acknowledged ? 'success' : 'warning'">
            {{ currentAlert.acknowledged ? '已确认' : '未确认' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="报警描述" :span="2">
          {{ currentAlert.message }}
        </el-descriptions-item>
        <el-descriptions-item label="自动处理动作" :span="2" v-if="currentAlert.autoAction">
          <el-tag type="info" size="small" style="margin-right:6px;">自动</el-tag>
          {{ currentAlert.autoAction }}
        </el-descriptions-item>
        <el-descriptions-item label="自动处理结果" :span="2" v-if="currentAlert.autoActionResult">
          {{ currentAlert.autoActionResult }}
        </el-descriptions-item>
        <el-descriptions-item label="确认人" v-if="currentAlert.acknowledgedBy">
          {{ currentAlert.acknowledgedBy }}
        </el-descriptions-item>
        <el-descriptions-item label="确认时间" v-if="currentAlert.acknowledgedTime">
          {{ formatDateTime(currentAlert.acknowledgedTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h4 style="margin:0;font-size:14px;">处置跟踪记录</h4>
          <el-button type="primary" size="small" @click="showAddDisposal = true">新增处置记录</el-button>
        </div>
        <el-table :data="disposalRecords" size="small" stripe border v-if="disposalRecords.length > 0">
          <el-table-column prop="createTime" label="时间" width="155">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="action" label="处置动作" width="160" />
          <el-table-column prop="operator" label="操作人" width="80" />
          <el-table-column prop="assignee" label="指派人" width="80" />
          <el-table-column label="进度" width="80">
            <template #default="{ row }">
              <el-tag :type="row.progress === 'completed' ? 'success' : row.progress === 'in_progress' ? 'warning' : 'info'" size="small">
                {{ row.progress === 'completed' ? '已完成' : row.progress === 'in_progress' ? '处置中' : '待处置' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="120" />
          <el-table-column label="操作" width="70">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="editDisposal(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无处置记录" :image-size="40" />
      </div>

      <el-dialog
        v-model="showAddDisposal"
        title="新增处置记录"
        width="440px"
        append-to-body
      >
        <el-form label-width="80px" size="default">
          <el-form-item label="处置动作">
            <el-input v-model="disposalForm.action" placeholder="如：派工、现场检查、停泵恢复" />
          </el-form-item>
          <el-form-item label="操作人">
            <el-input v-model="disposalForm.operator" placeholder="操作人" />
          </el-form-item>
          <el-form-item label="指派人">
            <el-input v-model="disposalForm.assignee" placeholder="指派给谁" />
          </el-form-item>
          <el-form-item label="处置进度">
            <el-select v-model="disposalForm.progress" style="width:100%;">
              <el-option label="待处置" value="pending" />
              <el-option label="处置中" value="in_progress" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="disposalForm.remark" type="textarea" :rows="2" placeholder="处理备注" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showAddDisposal = false">取消</el-button>
          <el-button type="primary" @click="saveDisposal">保存</el-button>
        </template>
      </el-dialog>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          :disabled="currentAlert?.acknowledged"
          @click="acknowledgeCurrent"
        >
          确认报警
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import {
  BellFilled, WarningFilled, Warning, InfoFilled,
  CircleCheckFilled, Refresh, Download
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePumpStore, useMonitoringStore } from '@/stores'
import {
  formatDateTime, getAlertLevelText, getAlertLevelType
} from '@/utils'
import type { Alert } from '@/types'

const pumpStore = usePumpStore()
const monitoringStore = useMonitoringStore()

const filterPumpId = ref<number | null>(null)
const filterAlertType = ref<string | null>(null)
const filterLevel = ref<string | null>(null)
const filterStatus = ref<boolean | null>(null)
const filterDisposal = ref<string | null>(null)
const dateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const selectedAlerts = ref<Alert[]>([])
const detailDialogVisible = ref(false)
const currentAlert = ref<Alert | null>(null)
const levelChartRef = ref<HTMLElement>()
const typeChartRef = ref<HTMLElement>()
const tableRef = ref()

const disposalRecords = ref<any[]>([])
const showAddDisposal = ref(false)
const disposalForm = ref({ action: '', operator: '当前用户', assignee: '', progress: 'pending', remark: '' })
const editingDisposalId = ref<number | null>(null)

let levelChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null

const alerts = computed<Alert[]>(() => {
  return monitoringStore.alerts
})

const disposalMap = computed(() => {
  const map = new Map<number, string>()
  disposalRecords.value.forEach(r => {
    const existing = map.get(r.alertId)
    if (!existing || r.progress === 'completed') {
      map.set(r.alertId, r.progress || 'pending')
    }
  })
  return map
})

const filteredAlerts = computed<Alert[]>(() => {
  let result = [...alerts.value]

  if (filterPumpId.value) {
    result = result.filter(a => a.pumpId === filterPumpId.value)
  }
  if (filterAlertType.value) {
    result = result.filter(a => a.alertType === filterAlertType.value)
  }
  if (filterLevel.value) {
    result = result.filter(a => a.alertLevel === filterLevel.value)
  }
  if (filterStatus.value !== null) {
    result = result.filter(a => a.acknowledged === filterStatus.value)
  }
  if (filterDisposal.value) {
    result = result.filter(a => {
      const dp = a.autoAction ? 'completed' : 'pending'
      return dp === filterDisposal.value
    })
  }
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const start = dateRange.value[0].getTime()
    const end = dateRange.value[1].getTime()
    result = result.filter(a => {
      const t = new Date(a.timestamp).getTime()
      return t >= start && t <= end
    })
  }

  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return result
})

const paginatedAlerts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAlerts.value.slice(start, start + pageSize.value)
})

const totalCount = computed(() => alerts.value.length)
const criticalCount = computed(() => alerts.value.filter(a => a.alertLevel === 'critical').length)
const dangerCount = computed(() => alerts.value.filter(a => a.alertLevel === 'danger').length)
const warningCount = computed(() => alerts.value.filter(a => a.alertLevel === 'warning').length)
const acknowledgedCount = computed(() => alerts.value.filter(a => a.acknowledged).length)
const unackCriticalCount = computed(() => alerts.value.filter(a => a.alertLevel === 'critical' && !a.acknowledged).length)
const unackDangerCount = computed(() => alerts.value.filter(a => a.alertLevel === 'danger' && !a.acknowledged).length)
const unackWarningCount = computed(() => alerts.value.filter(a => a.alertLevel === 'warning' && !a.acknowledged).length)

function getPumpName(pumpId: number): string {
  const pump = pumpStore.pumps.find(p => p.id === pumpId)
  return pump?.name || `泵站#${pumpId}`
}

function getDisposalTagType(alert: Alert): string {
  if (alert.autoAction) return 'success'
  return 'info'
}

function getDisposalStatusText(alert: Alert): string {
  if (alert.autoAction) return '已处置'
  return '待处置'
}

function handleSelectionChange(selection: Alert[]) {
  selectedAlerts.value = selection.filter(a => !a.acknowledged)
}

async function viewDetail(alert: Alert) {
  currentAlert.value = alert
  detailDialogVisible.value = true
  await loadDisposalRecords(alert.id)
}

async function loadDisposalRecords(alertId: number) {
  try {
    disposalRecords.value = await monitoringStore.loadDisposalRecords(alertId)
  } catch (e) {
    disposalRecords.value = []
  }
}

async function acknowledge(alert: Alert) {
  try {
    await ElMessageBox.confirm('确定要确认该报警吗？', '确认报警', { type: 'warning' })
    await monitoringStore.ackAlert(alert.id, '当前用户')
    ElMessage.success('报警已确认')
    updateCharts()
  } catch {
    // user cancelled
  }
}

function acknowledgeCurrent() {
  if (currentAlert.value) {
    acknowledge(currentAlert.value)
  }
}

async function batchAcknowledge() {
  if (selectedAlerts.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要确认选中的 ${selectedAlerts.value.length} 条报警吗？`,
      '批量确认',
      { type: 'warning' }
    )
    for (const alert of selectedAlerts.value) {
      await monitoringStore.ackAlert(alert.id, '当前用户')
    }
    ;(tableRef.value as any)?.clearSelection()
    ElMessage.success(`已确认 ${selectedAlerts.value.length} 条报警`)
    updateCharts()
  } catch {
    // user cancelled
  }
}

function editDisposal(row: any) {
  editingDisposalId.value = row.id
  disposalForm.value = {
    action: row.action,
    operator: row.operator,
    assignee: row.assignee || '',
    progress: row.progress || 'pending',
    remark: row.remark || ''
  }
  showAddDisposal.value = true
}

async function saveDisposal() {
  if (!disposalForm.value.action) {
    ElMessage.warning('请填写处置动作')
    return
  }
  try {
    if (editingDisposalId.value) {
      await monitoringStore.updateDisposalRecord(editingDisposalId.value, disposalForm.value)
      ElMessage.success('处置记录已更新')
    } else if (currentAlert.value) {
      await monitoringStore.addDisposalRecord({
        alertId: currentAlert.value.id,
        ...disposalForm.value
      })
      ElMessage.success('处置记录已添加')
    }
    showAddDisposal.value = false
    editingDisposalId.value = null
    disposalForm.value = { action: '', operator: '当前用户', assignee: '', progress: 'pending', remark: '' }
    if (currentAlert.value) {
      await loadDisposalRecords(currentAlert.value.id)
    }
  } catch (e) {
    ElMessage.error('保存处置记录失败')
  }
}

watch(showAddDisposal, (val) => {
  if (!val) {
    editingDisposalId.value = null
    disposalForm.value = { action: '', operator: '当前用户', assignee: '', progress: 'pending', remark: '' }
  }
})

function exportAlerts() {
  const data = filteredAlerts.value
  if (data.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const headers = ['时间', '泵站', '报警类型', '级别', '参数', '实际值', '阈值', '确认状态', '自动处理动作', '处理结果', '确认人', '确认时间']
  const rows = data.map(a => [
    formatDateTime(a.timestamp),
    getPumpName(a.pumpId),
    a.alertType,
    getAlertLevelText(a.alertLevel),
    a.parameter,
    a.actualValue?.toFixed(2) ?? '',
    a.threshold?.toFixed(2) ?? '',
    a.acknowledged ? '已确认' : '未确认',
    a.autoAction || '',
    a.autoActionResult || '',
    a.acknowledgedBy || '',
    a.acknowledgedTime ? formatDateTime(a.acknowledgedTime) : ''
  ])

  const BOM = '\uFEFF'
  const csv = BOM + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `报警事件_${dayjs().format('YYYYMMDD_HHmmss')}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${data.length} 条报警记录`)
}

function initLevelChart() {
  if (!levelChartRef.value) return
  levelChart = echarts.init(levelChartRef.value)
  updateLevelChart()
}

function updateLevelChart() {
  if (!levelChart) return

  levelChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 条 ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '40%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: [
        {
          value: criticalCount.value,
          name: '紧急',
          itemStyle: { color: '#F56C6C' }
        },
        {
          value: dangerCount.value,
          name: '危险',
          itemStyle: { color: '#E6A23C' }
        },
        {
          value: warningCount.value,
          name: '预警',
          itemStyle: { color: '#F0C78A' }
        }
      ]
    }]
  })
}

function initTypeChart() {
  if (!typeChartRef.value) return
  typeChart = echarts.init(typeChartRef.value)
  updateTypeChart()
}

function updateTypeChart() {
  if (!typeChart) return

  const typeCounts: Record<string, number> = {}
  alerts.value.forEach(a => {
    typeCounts[a.alertType] = (typeCounts[a.alertType] || 0) + 1
  })

  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#F0C78A', '#79BBFF']

  typeChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 条 ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 5,
      top: 'center',
      textStyle: { fontSize: 11 }
    },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: Object.entries(typeCounts).map(([name, value], index) => ({
        name,
        value,
        itemStyle: { color: colors[index % colors.length] }
      }))
    }]
  })
}

function updateCharts() {
  updateLevelChart()
  updateTypeChart()
}

async function loadAlerts() {
  try {
    await monitoringStore.loadAlerts()
    updateCharts()
    ElMessage.success('数据已刷新')
  } catch (e) {
    updateCharts()
  }
}

async function init() {
  await pumpStore.loadPumps()
  await loadAlerts()

  nextTick(() => {
    initLevelChart()
    initTypeChart()
  })
}

onMounted(init)

onUnmounted(() => {
  levelChart?.dispose()
  typeChart?.dispose()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 8px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #ebeef5;
}

.stat-card.red {
  background: linear-gradient(135deg, #fef0f0 0%, #fff 100%);
}

.stat-card.orange {
  background: linear-gradient(135deg, #fdf6ec 0%, #fff 100%);
}

.stat-card.yellow {
  background: linear-gradient(135deg, #fdfcee 0%, #fff 100%);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-card.red .stat-icon {
  background: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.stat-card.orange .stat-icon {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.stat-card.yellow .stat-icon {
  background: rgba(240, 199, 138, 0.2);
  color: #E6A23C;
}

.stat-card:not(.red):not(.orange):not(.yellow) .stat-icon {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-sub {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-right {
  display: flex;
  align-items: center;
}

.alert-table {
  font-size: 13px;
}

.actual-value {
  color: #F56C6C;
  font-weight: 600;
}

.threshold-value {
  color: #909399;
}

.highlight-value {
  color: #F56C6C;
  font-weight: 600;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
