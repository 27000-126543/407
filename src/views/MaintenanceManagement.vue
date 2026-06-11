<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Tools /></el-icon>
        设备维保管理
      </h2>
      <div class="header-actions">
        <el-button type="primary" :icon="MagicStick" @click="handleGenerateOrders">
          自动生成工单
        </el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">待处理工单</div>
          <div class="value warning">{{ pendingCount }}</div>
          <div class="trend">需要及时处理</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">处理中工单</div>
          <div class="value primary">{{ inProgressCount }}</div>
          <div class="trend">正在进行维护</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">已完成工单</div>
          <div class="value success">{{ completedCount }}</div>
          <div class="trend">本月完成 {{ monthCompletedCount }} 单</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">已取消工单</div>
          <div class="value">{{ cancelledCount }}</div>
          <div class="trend">共 {{ totalCount }} 条工单</div>
        </div>
      </el-col>
    </el-row>

    <div class="filter-bar">
      <el-form :inline="true" :model="filterForm" size="default">
        <el-form-item label="工单类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable style="width: 140px;">
            <el-option label="预防性" value="preventive" />
            <el-option label="纠正性" value="corrective" />
            <el-option label="预测性" value="predictive" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filterForm.priority" placeholder="全部优先级" clearable style="width: 140px;">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 140px;">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="泵站">
          <el-select v-model="filterForm.pumpId" placeholder="全部泵站" clearable style="width: 180px;">
            <el-option v-for="pump in pumps" :key="pump.id" :label="pump.name" :value="pump.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadOrders">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="filteredOrders" stripe size="default" class="data-table">
        <el-table-column prop="orderNo" label="工单号" width="180" />
        <el-table-column prop="pumpName" label="泵站" width="160">
          <template #default="{ row }">
            {{ getPumpName(row.pumpId) }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getOrderTypeTag(row.type)" size="small">
              {{ getOrderTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getMaintenancePriorityType(row.priority)" size="small">
              {{ getMaintenancePriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="assignedTeam" label="分配班组" width="120" />
        <el-table-column prop="planDate" label="计划日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.planDate) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getMaintenanceStatusType(row.status)" size="small">
              {{ getMaintenanceStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="触发原因" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.triggerReason">{{ row.triggerReason }}</span>
            <span v-else class="text-muted">手动创建</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="primary" link @click="handleStart(row)">
                开始处理
              </el-button>
              <el-button size="small" type="info" link @click="handleView(row)">
                详情
              </el-button>
              <el-button size="small" type="danger" link @click="handleCancel(row)">
                取消
              </el-button>
            </template>
            <template v-else-if="row.status === 'in_progress'">
              <el-button size="small" type="success" link @click="handleComplete(row)">
                完成工单
              </el-button>
              <el-button size="small" type="info" link @click="handleView(row)">
                详情
              </el-button>
              <el-button size="small" type="danger" link @click="handleCancel(row)">
                取消
              </el-button>
            </template>
            <template v-else>
              <el-button size="small" type="info" link @click="handleView(row)">
                详情
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailDialogVisible" title="工单详情" width="700px">
      <el-descriptions v-if="currentOrder" :column="2" border>
        <el-descriptions-item label="工单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="泵站">{{ getPumpName(currentOrder.pumpId) }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="getOrderTypeTag(currentOrder.type)" size="small">
            {{ getOrderTypeText(currentOrder.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getMaintenancePriorityType(currentOrder.priority)" size="small">
            {{ getMaintenancePriorityText(currentOrder.priority) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getMaintenanceStatusType(currentOrder.status)" size="small">
            {{ getMaintenanceStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="分配班组">{{ currentOrder.assignedTeam }}</el-descriptions-item>
        <el-descriptions-item label="计划日期">{{ formatDate(currentOrder.planDate) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(currentOrder.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="实际开始时间">
          {{ currentOrder.actualStartDate ? formatDateTime(currentOrder.actualStartDate) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="实际完成时间">
          {{ currentOrder.actualEndDate ? formatDateTime(currentOrder.actualEndDate) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentOrder.description }}</el-descriptions-item>
        <el-descriptions-item label="触发原因" :span="2">
          {{ currentOrder.triggerReason || '手动创建' }}
        </el-descriptions-item>
        <el-descriptions-item label="触发值" :span="2" v-if="currentOrder.triggerValue">
          <span v-if="currentOrder.triggerValue.runtime">运行时长: {{ currentOrder.triggerValue.runtime }}h</span>
          <span v-if="currentOrder.triggerValue.startCount">, 启停次数: {{ currentOrder.triggerValue.startCount }}次</span>
        </el-descriptions-item>
        <el-descriptions-item label="所需备件" :span="2" v-if="currentOrder.partsRequired?.length">
          <div v-for="part in currentOrder.partsRequired" :key="part.partId" class="part-item">
            {{ part.partName }} × {{ part.quantity }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="completeDialogVisible" title="完成工单" width="500px">
      <el-form :model="completeForm" label-width="100px">
        <el-alert v-if="currentOrder?.partsRequired?.length" type="info" :closable="false" style="margin-bottom: 16px;">
          <template #title>
            将自动扣减以下备件库存：
            <div v-for="part in currentOrder.partsRequired" :key="part.partId" class="part-item">
              {{ part.partName }} × {{ part.quantity }}
            </div>
          </template>
        </el-alert>
        <el-form-item label="完成备注">
          <el-input v-model="completeForm.remark" type="textarea" :rows="4" placeholder="请输入维护完成情况说明..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmComplete">确认完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Tools, MagicStick, Refresh } from '@element-plus/icons-vue'
import { useMaintenanceStore, useInventoryStore, usePumpStore } from '@/stores'
import { getMaintenancePriorityText, getMaintenancePriorityType, getMaintenanceStatusText, getMaintenanceStatusType, formatDate, formatDateTime } from '@/utils'
import type { MaintenanceOrder } from '@/types'

const maintenanceStore = useMaintenanceStore()
const inventoryStore = useInventoryStore()
const pumpStore = usePumpStore()

const detailDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const currentOrder = ref<MaintenanceOrder | null>(null)

const filterForm = reactive({
  type: '',
  priority: '',
  status: '',
  pumpId: null as number | null
})

const completeForm = reactive({
  remark: ''
})

const orders = computed(() => maintenanceStore.orders)
const pumps = computed(() => pumpStore.pumps)

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    if (filterForm.type && order.type !== filterForm.type) return false
    if (filterForm.priority && order.priority !== filterForm.priority) return false
    if (filterForm.status && order.status !== filterForm.status) return false
    if (filterForm.pumpId && order.pumpId !== filterForm.pumpId) return false
    return true
  })
})

const pendingCount = computed(() => orders.value.filter(o => o.status === 'pending').length)
const inProgressCount = computed(() => orders.value.filter(o => o.status === 'in_progress').length)
const completedCount = computed(() => orders.value.filter(o => o.status === 'completed').length)
const cancelledCount = computed(() => orders.value.filter(o => o.status === 'cancelled').length)
const totalCount = computed(() => orders.value.length)

const monthCompletedCount = computed(() => {
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  return orders.value.filter(o => o.status === 'completed' && o.actualEndDate && o.actualEndDate >= monthStart).length
})

function getPumpName(pumpId: number): string {
  const pump = pumps.value.find(p => p.id === pumpId)
  return pump?.name || `泵站#${pumpId}`
}

function getOrderTypeText(type: string): string {
  const map: Record<string, string> = {
    preventive: '预防性',
    corrective: '纠正性',
    predictive: '预测性'
  }
  return map[type] || type
}

function getOrderTypeTag(type: string): string {
  const map: Record<string, string> = {
    preventive: 'success',
    corrective: 'warning',
    predictive: 'primary'
  }
  return map[type] || 'info'
}

async function loadData() {
  await Promise.all([
    maintenanceStore.loadOrders(),
    pumpStore.loadPumps(),
    inventoryStore.loadItems()
  ])
}

function loadOrders() {
  maintenanceStore.loadOrders()
}

function resetFilter() {
  filterForm.type = ''
  filterForm.priority = ''
  filterForm.status = ''
  filterForm.pumpId = null
  loadOrders()
}

async function handleGenerateOrders() {
  try {
    await ElMessageBox.confirm(
      '系统将根据泵站运行时长(>2000h)和启停次数(>500次)自动生成预防性维保工单，是否继续？',
      '自动生成工单',
      { type: 'info' }
    )
    const ids = await maintenanceStore.generateOrders()
    if (ids.length > 0) {
      ElMessage.success(`成功生成 ${ids.length} 条维保工单`)
    } else {
      ElMessage.info('当前没有符合条件的泵站需要维护')
    }
  } catch {
    // 用户取消
  }
}

function handleView(row: MaintenanceOrder) {
  currentOrder.value = row
  detailDialogVisible.value = true
}

async function handleStart(row: MaintenanceOrder) {
  try {
    await ElMessageBox.confirm(
      `确定要开始处理工单【${row.orderNo}】吗？`,
      '开始处理',
      { type: 'warning' }
    )
    await maintenanceStore.updateOrder(row.id, {
      ...row,
      status: 'in_progress',
      actualStartDate: new Date().toISOString()
    })
    ElMessage.success('工单已开始处理')
  } catch {
    // 用户取消
  }
}

function handleComplete(row: MaintenanceOrder) {
  currentOrder.value = row
  completeForm.remark = ''
  completeDialogVisible.value = true
}

async function confirmComplete() {
  if (!currentOrder.value) return

  try {
    if (currentOrder.value.partsRequired?.length) {
      for (const part of currentOrder.value.partsRequired) {
        const success = await inventoryStore.deductItem(part.partId, part.quantity)
        if (!success) {
          ElMessage.error(`备件【${part.partName}】库存不足，无法完成工单`)
          return
        }
      }
    }

    await maintenanceStore.updateOrder(currentOrder.value.id, {
      ...currentOrder.value,
      status: 'completed',
      actualEndDate: new Date().toISOString(),
      remark: completeForm.remark
    })

    ElMessage.success('工单已完成，备件已扣减')
    completeDialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function handleCancel(row: MaintenanceOrder) {
  try {
    await ElMessageBox.confirm(
      `确定要取消工单【${row.orderNo}】吗？`,
      '取消工单',
      { type: 'warning' }
    )
    await maintenanceStore.updateOrder(row.id, {
      ...row,
      status: 'cancelled'
    })
    ElMessage.success('工单已取消')
  } catch {
    // 用户取消
  }
}

onMounted(loadData)
</script>

<style scoped>
.part-item {
  padding: 4px 0;
}
</style>
