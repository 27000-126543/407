<template>
  <div class="schedule-management">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Calendar /></el-icon>
        调度方案管理
      </h2>
      <div class="header-actions">
        <el-date-picker
          v-model="generateDate"
          type="date"
          placeholder="选择生成日期"
          value-format="YYYY-MM-DD"
          style="width: 180px; margin-right: 10px;"
        />
        <el-button type="primary" @click="handleGenerateSchedules" :loading="generating">
          <el-icon><MagicStick /></el-icon>
          自动生成方案
        </el-button>
      </div>
    </div>

    <div class="stats-row">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="label">待审批</div>
            <div class="value warning">{{ pendingCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="label">已批准</div>
            <div class="value success">{{ approvedCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="label">已确认</div>
            <div class="value primary">{{ confirmedCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="label">已执行</div>
            <div class="value">{{ executedCount }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="filter-bar">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="日期">
          <el-date-picker
            v-model="filterForm.scheduleDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>
        <el-form-item label="泵站">
          <el-select v-model="filterForm.pumpId" placeholder="请选择泵站" clearable style="width: 180px;">
            <el-option
              v-for="pump in pumpStore.pumps"
              :key="pump.id"
              :label="pump.name"
              :value="pump.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审批" value="pending_approval" />
            <el-option label="已批准" value="approved" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="申请调整" value="adjust_requested" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已执行" value="executed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="filteredSchedules" stripe border class="data-table" v-loading="loading">
        <el-table-column prop="scheduleDate" label="日期" min-width="120" />
        <el-table-column prop="pumpName" label="泵站名称" min-width="120" />
        <el-table-column label="计划时间" min-width="160">
          <template #default="{ row }">
            {{ row.planStartTime }} - {{ row.planEndTime }}
          </template>
        </el-table-column>
        <el-table-column prop="plannedFlow" label="计划流量(m³/h)" min-width="130">
          <template #default="{ row }">{{ row.plannedFlow }}</template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getScheduleStatusType(row.status)" size="small">
              {{ getScheduleStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approver" label="审批人" min-width="100">
          <template #default="{ row }">{{ row.approver || '-' }}</template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" min-width="100">
          <template #default="{ row }">{{ row.operator || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">详情</el-button>
            <el-button
              v-if="row.status === 'pending_approval' || row.status === 'adjust_requested'"
              size="small"
              type="success"
              link
              @click="handleApprove(row)"
            >
              审批通过
            </el-button>
            <el-button
              v-if="row.status === 'pending_approval' || row.status === 'adjust_requested'"
              size="small"
              type="danger"
              link
              @click="handleReject(row)"
            >
              驳回
            </el-button>
            <el-button
              v-if="row.status === 'approved'"
              size="small"
              type="primary"
              link
              @click="handleConfirm(row)"
            >
              确认执行
            </el-button>
            <el-button
              v-if="row.status === 'approved' || row.status === 'pending_approval'"
              size="small"
              type="warning"
              link
              @click="handleRequestAdjust(row)"
            >
              申请调整
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="detailDialogVisible"
      title="调度方案详情"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="currentSchedule">
        <el-descriptions-item label="日期">{{ currentSchedule.scheduleDate }}</el-descriptions-item>
        <el-descriptions-item label="泵站名称">{{ currentSchedule.pumpName }}</el-descriptions-item>
        <el-descriptions-item label="计划开始时间">{{ currentSchedule.planStartTime }}</el-descriptions-item>
        <el-descriptions-item label="计划结束时间">{{ currentSchedule.planEndTime }}</el-descriptions-item>
        <el-descriptions-item label="计划流量">{{ currentSchedule.plannedFlow }} m³/h</el-descriptions-item>
        <el-descriptions-item label="运行机组">{{ getOperatingUnitsText(currentSchedule) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getScheduleStatusType(currentSchedule.status)" size="small">
            {{ getScheduleStatusText(currentSchedule.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批人">{{ currentSchedule.approver || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批意见">{{ currentSchedule.approvalComment || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批时间">{{ currentSchedule.approvalTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentSchedule.operator || '-' }}</el-descriptions-item>
        <el-descriptions-item label="确认时间">{{ currentSchedule.confirmTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="调整原因">{{ currentSchedule.adjustReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="调整申请时间">{{ currentSchedule.adjustRequestTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="调度原因" :span="2">{{ currentSchedule.reason }}</el-descriptions-item>
        <el-descriptions-item label="约束条件" :span="2">{{ currentSchedule.constraints }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ formatDateTime(currentSchedule.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog
      v-model="approveDialogVisible"
      title="审批方案"
      width="500px"
    >
      <el-form :model="approveForm" label-width="80px">
        <el-form-item label="审批意见">
          <el-input
            v-model="approveForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove">确认通过</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="rejectDialogVisible"
      title="驳回方案"
      width="500px"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="驳回原因">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReject">确认驳回</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="adjustDialogVisible"
      title="申请调整"
      width="500px"
    >
      <el-form :model="adjustForm" label-width="80px">
        <el-form-item label="调整原因">
          <el-input
            v-model="adjustForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="submitAdjust">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, MagicStick, Search, Refresh } from '@element-plus/icons-vue'
import { useScheduleStore, usePumpStore, useWeatherStore, useTopologyStore } from '@/stores'
import { getScheduleStatusText, getScheduleStatusType, formatDateTime } from '@/utils'
import { generateDailySchedules, validateSchedule } from '@/utils/scheduleAlgorithm'
import type { Schedule } from '@/types'

const scheduleStore = useScheduleStore()
const pumpStore = usePumpStore()
const weatherStore = useWeatherStore()
const topologyStore = useTopologyStore()

const loading = ref(false)
const generating = ref(false)
const detailDialogVisible = ref(false)
const approveDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const adjustDialogVisible = ref(false)
const currentSchedule = ref<Schedule | null>(null)
const generateDate = ref(dayjs().format('YYYY-MM-DD'))

const filterForm = reactive({
  scheduleDate: '',
  pumpId: '',
  status: ''
})

const approveForm = reactive({
  comment: ''
})

const rejectForm = reactive({
  reason: ''
})

const adjustForm = reactive({
  reason: ''
})

const filteredSchedules = computed(() => {
  let result = scheduleStore.schedules
  if (filterForm.scheduleDate) {
    result = result.filter(s => s.scheduleDate === filterForm.scheduleDate)
  }
  if (filterForm.pumpId) {
    result = result.filter(s => s.pumpId === Number(filterForm.pumpId))
  }
  if (filterForm.status) {
    result = result.filter(s => s.status === filterForm.status)
  }
  return result.sort((a, b) => {
    if (a.scheduleDate !== b.scheduleDate) {
      return b.scheduleDate.localeCompare(a.scheduleDate)
    }
    return a.planStartTime.localeCompare(b.planStartTime)
  })
})

const pendingCount = computed(() =>
  scheduleStore.schedules.filter(s => s.status === 'pending_approval' || s.status === 'adjust_requested').length
)

const approvedCount = computed(() =>
  scheduleStore.schedules.filter(s => s.status === 'approved').length
)

const confirmedCount = computed(() =>
  scheduleStore.schedules.filter(s => s.status === 'confirmed').length
)

const executedCount = computed(() =>
  scheduleStore.schedules.filter(s => s.status === 'executed').length
)

function handleSearch() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

function handleReset() {
  filterForm.scheduleDate = ''
  filterForm.pumpId = ''
  filterForm.status = ''
  handleSearch()
}

function getOperatingUnitsText(schedule: Schedule): string {
  if (!schedule.operatingUnits || schedule.operatingUnits.length === 0) return '-'
  const pump = pumpStore.pumps.find(p => p.id === schedule.pumpId)
  if (!pump || !pump.units) return schedule.operatingUnits.join(', ')
  return schedule.operatingUnits.map(uid => {
    const unit = (pump.units as any[]).find(u => u.id === uid)
    return unit ? unit.unitNumber : String(uid)
  }).join('、')
}

function handleView(row: Schedule) {
  currentSchedule.value = row
  detailDialogVisible.value = true
}

function handleApprove(row: Schedule) {
  currentSchedule.value = row
  approveForm.comment = ''
  approveDialogVisible.value = true
}

function handleReject(row: Schedule) {
  currentSchedule.value = row
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

function handleConfirm(row: Schedule) {
  ElMessageBox.confirm(
    `确定要确认执行"${row.pumpName}"的调度方案吗？`,
    '确认执行',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await scheduleStore.confirmSchedule(row.id, '当前用户')
      ElMessage.success('确认执行成功')
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

function handleRequestAdjust(row: Schedule) {
  currentSchedule.value = row
  adjustForm.reason = ''
  adjustDialogVisible.value = true
}

async function submitApprove() {
  if (!currentSchedule.value) return
  try {
    await scheduleStore.approveSchedule(currentSchedule.value.id, '当前用户', approveForm.comment)
    ElMessage.success('审批通过')
    approveDialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function submitReject() {
  if (!currentSchedule.value || !rejectForm.reason.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  try {
    await scheduleStore.rejectSchedule(currentSchedule.value.id, '当前用户', rejectForm.reason)
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
  } catch (error) {
    console.error('驳回失败:', error)
    ElMessage.error('操作失败')
  }
}

async function submitAdjust() {
  if (!currentSchedule.value || !adjustForm.reason.trim()) {
    ElMessage.warning('请输入调整原因')
    return
  }
  try {
    await scheduleStore.requestAdjust(currentSchedule.value.id, '当前用户', adjustForm.reason)
    ElMessage.success('调整申请已提交')
    adjustDialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function handleGenerateSchedules() {
  if (!generateDate.value) {
    ElMessage.warning('请选择生成日期')
    return
  }

  generating.value = true
  try {
    await pumpStore.loadPumps()
    await weatherStore.loadForecast()
    await topologyStore.loadNodes()

    const generatedSchedules = generateDailySchedules({
      pumps: pumpStore.pumps,
      weatherForecast: weatherStore.forecast,
      pipelineLevels: topologyStore.nodes,
      date: generateDate.value
    })

    if (generatedSchedules.length === 0) {
      ElMessage.info('根据当前天气和水位条件，今日无需生成调度方案')
      return
    }

    const validSchedules: typeof generatedSchedules = []
    const warnings: string[] = []

    for (const schedule of generatedSchedules) {
      const validation = validateSchedule(schedule, pumpStore.pumps)
      if (validation.valid) {
        validSchedules.push(schedule)
      } else {
        warnings.push(`${schedule.pumpName}: ${validation.warnings.join(', ')}`)
      }
    }

    if (validSchedules.length === 0) {
      ElMessage.error('生成的方案均未通过校验：' + warnings.join('; '))
      return
    }

    for (const schedule of validSchedules) {
      await scheduleStore.createSchedule({
        ...schedule,
        status: 'pending_approval'
      })
    }

    let message = `成功生成 ${validSchedules.length} 条调度方案`
    if (warnings.length > 0) {
      message += `，其中 ${warnings.length} 条因校验未通过被跳过：${warnings.join('; ')}`
    }
    ElMessage.success(message)

    await scheduleStore.loadSchedules()
  } catch (error) {
    ElMessage.error('生成方案失败')
  } finally {
    generating.value = false
  }
}

async function init() {
  loading.value = true
  try {
    await Promise.all([
      scheduleStore.loadSchedules(),
      pumpStore.loadPumps(),
      weatherStore.loadForecast(),
      topologyStore.loadNodes()
    ])
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(init)
</script>

<style scoped>
.schedule-management {
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-card .label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-card .value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-card .value.warning {
  color: #e6a23c;
}

.stat-card .value.success {
  color: #67c23a;
}

.stat-card .value.primary {
  color: #409eff;
}

.filter-bar {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.filter-form {
  margin: 0;
}

.table-container {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
}
</style>
