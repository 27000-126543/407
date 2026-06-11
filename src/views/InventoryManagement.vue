<template>
  <div>
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Goods /></el-icon>
        备件库存管理
      </h2>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">库存总项数</div>
          <div class="value primary">{{ totalItems }}</div>
          <div class="trend">共 {{ totalQuantity }} 件</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">低库存预警</div>
          <div class="value warning">{{ lowStockCount }}</div>
          <div class="trend">低于安全库存</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">紧急补货</div>
          <div class="value danger">{{ criticalLowCount }}</div>
          <div class="trend">低于最低库存</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="label">本月出入库</div>
          <div class="value success">{{ monthRecordCount }}</div>
          <div class="trend">入库 {{ monthInboundCount }} / 出库 {{ monthOutboundCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row v-if="lowStockItems.length > 0" :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="24">
        <el-alert type="warning" :closable="false" show-icon>
          <template #title>
            <span style="font-weight: 600;">安全库存预警</span>
          </template>
          <template #default>
            <div class="low-stock-list">
              <el-tag 
                v-for="item in lowStockItems" 
                :key="item.id"
                :type="item.quantity < item.minStock ? 'danger' : 'warning'"
                size="small"
                style="margin-right: 8px; margin-bottom: 4px;"
              >
                {{ item.partName }} - 当前: {{ item.quantity }}{{ item.unit }} / 安全: {{ item.safeStock }}{{ item.unit }}
              </el-tag>
            </div>
          </template>
        </el-alert>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="16">
        <div class="table-container">
          <div class="table-header">
            <h3 class="table-title">库存列表</h3>
            <div class="table-actions">
              <el-input 
                v-model="searchKeyword" 
                placeholder="搜索备件编号/名称" 
                clearable
                style="width: 200px; margin-right: 8px;"
                :prefix-icon="Search"
              />
            </div>
          </div>
          <el-table :data="filteredItems" stripe size="default" class="data-table">
            <el-table-column prop="partNo" label="备件编号" width="120" />
            <el-table-column prop="partName" label="名称" width="140" />
            <el-table-column prop="specification" label="规格" width="140" />
            <el-table-column prop="unit" label="单位" width="80" align="center" />
            <el-table-column label="当前库存" width="110" align="center">
              <template #default="{ row }">
                <span 
                  :class="{
                    'text-danger': row.quantity < row.minStock,
                    'text-warning': row.quantity >= row.minStock && row.quantity < row.safeStock,
                    'text-success': row.quantity >= row.safeStock
                  }"
                  style="font-weight: 600;"
                >
                  {{ row.quantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="safeStock" label="安全库存" width="100" align="center" />
            <el-table-column prop="minStock" label="最低库存" width="100" align="center" />
            <el-table-column prop="location" label="库位" width="100" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.quantity < row.minStock" type="danger" size="small">紧急</el-tag>
                <el-tag v-else-if="row.quantity < row.safeStock" type="warning" size="small">预警</el-tag>
                <el-tag v-else type="success" size="small">正常</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="success" link @click="handleInbound(row)">入库</el-button>
                <el-button size="small" type="warning" link @click="handleOutbound(row)">出库</el-button>
                <el-button size="small" type="primary" link @click="handleEdit(row)">调整</el-button>
                <el-button size="small" type="info" link @click="handleViewRecords(row)">记录</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="table-container">
          <div class="table-header">
            <h3 class="table-title">出入库记录</h3>
            <div class="table-actions">
              <el-button size="small" link @click="loadRecords">刷新</el-button>
            </div>
          </div>
          <el-table :data="records" stripe size="default" class="data-table" max-height="500">
            <el-table-column label="类型" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.type === 'inbound' ? 'success' : 'warning'" size="small">
                  {{ row.type === 'inbound' ? '入库' : '出库' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="partName" label="备件" width="100" show-overflow-tooltip />
            <el-table-column label="数量" width="80" align="center">
              <template #default="{ row }">
                <span :class="row.type === 'inbound' ? 'text-success' : 'text-warning'">
                  {{ row.type === 'inbound' ? '+' : '-' }}{{ row.quantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="变动前" width="80" align="center">
              <template #default="{ row }">
                {{ row.beforeQuantity }}
              </template>
            </el-table-column>
            <el-table-column label="变动后" width="80" align="center">
              <template #default="{ row }">
                {{ row.afterQuantity }}
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" width="80" />
            <el-table-column label="时间" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="原因" show-overflow-tooltip />
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="inboundDialogVisible" title="备件入库" width="500px">
      <el-form :model="inboundForm" :rules="inboundRules" ref="inboundFormRef" label-width="100px">
        <el-form-item label="备件名称">
          <el-input v-model="currentItem?.partName" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :model-value="currentItem?.quantity" disabled />
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="inboundForm.quantity" :min="1" :max="9999" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="inboundForm.operator" placeholder="请输入操作人姓名" />
        </el-form-item>
        <el-form-item label="入库原因" prop="reason">
          <el-input v-model="inboundForm.reason" type="textarea" :rows="3" placeholder="请输入入库原因，如：采购入库、盘点盘盈等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inboundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmInbound">确认入库</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="outboundDialogVisible" title="备件出库" width="500px">
      <el-form :model="outboundForm" :rules="outboundRules" ref="outboundFormRef" label-width="100px">
        <el-form-item label="备件名称">
          <el-input v-model="currentItem?.partName" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :model-value="currentItem?.quantity" disabled />
        </el-form-item>
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number v-model="outboundForm.quantity" :min="1" :max="currentItem?.quantity || 1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="outboundForm.operator" placeholder="请输入操作人姓名" />
        </el-form-item>
        <el-form-item label="出库原因" prop="reason">
          <el-input v-model="outboundForm.reason" type="textarea" :rows="3" placeholder="请输入出库原因，如：维修领用、报损等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="outboundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmOutbound">确认出库</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="库存调整" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="备件编号">
          <el-input v-model="currentItem?.partNo" disabled />
        </el-form-item>
        <el-form-item label="备件名称">
          <el-input v-model="currentItem?.partName" disabled />
        </el-form-item>
        <el-form-item label="当前库存" prop="quantity">
          <el-input-number v-model="editForm.quantity" :min="0" :max="9999" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="安全库存" prop="safeStock">
          <el-input-number v-model="editForm.safeStock" :min="0" :max="9999" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="最低库存" prop="minStock">
          <el-input-number v-model="editForm.minStock" :min="0" :max="editForm.safeStock" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="库位" prop="location">
          <el-input v-model="editForm.location" placeholder="请输入库位编号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="recordsDialogVisible" title="出入库记录" width="800px">
      <div style="margin-bottom: 12px;">
        <el-tag type="info">备件：{{ currentItem?.partName }} ({{ currentItem?.partNo }})</el-tag>
      </div>
      <el-table :data="partRecords" stripe size="default" class="data-table">
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'inbound' ? 'success' : 'warning'" size="small">
              {{ row.type === 'inbound' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="100" align="center">
          <template #default="{ row }">
            <span :class="row.type === 'inbound' ? 'text-success' : 'text-warning'" style="font-weight: 600;">
              {{ row.type === 'inbound' ? '+' : '-' }}{{ row.quantity }} {{ currentItem?.unit }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变动前" width="100" align="center">
          <template #default="{ row }">{{ row.beforeQuantity }} {{ currentItem?.unit }}</template>
        </el-table-column>
        <el-table-column label="变动后" width="100" align="center">
          <template #default="{ row }">{{ row.afterQuantity }} {{ currentItem?.unit }}</template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="150" show-overflow-tooltip />
        <el-table-column prop="relatedOrderNo" label="关联工单" width="140" />
      </el-table>
      <template #footer>
        <el-button @click="recordsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Goods, Refresh, Search } from '@element-plus/icons-vue'
import { useInventoryStore } from '@/stores'
import { formatDateTime } from '@/utils'
import type { InventoryItem, InventoryRecord } from '@/types'

const inventoryStore = useInventoryStore()

const searchKeyword = ref('')
const inboundDialogVisible = ref(false)
const outboundDialogVisible = ref(false)
const editDialogVisible = ref(false)
const recordsDialogVisible = ref(false)
const currentItem = ref<InventoryItem | null>(null)
const partRecords = ref<InventoryRecord[]>([])

const inboundFormRef = ref<FormInstance>()
const outboundFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

const inboundForm = reactive({
  quantity: 1,
  operator: '',
  reason: ''
})

const outboundForm = reactive({
  quantity: 1,
  operator: '',
  reason: ''
})

const editForm = reactive({
  quantity: 0,
  safeStock: 0,
  minStock: 0,
  location: ''
})

const inboundRules: FormRules = {
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入入库原因', trigger: 'blur' }]
}

const outboundRules: FormRules = {
  quantity: [{ required: true, message: '请输入出库数量', trigger: 'blur' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入出库原因', trigger: 'blur' }]
}

const editRules: FormRules = {
  quantity: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  safeStock: [{ required: true, message: '请输入安全库存', trigger: 'blur' }],
  minStock: [{ required: true, message: '请输入最低库存', trigger: 'blur' }],
  location: [{ required: true, message: '请输入库位', trigger: 'blur' }]
}

const items = computed(() => inventoryStore.items)
const records = computed(() => inventoryStore.records)
const lowStockItems = computed(() => inventoryStore.lowStockItems)

const filteredItems = computed(() => {
  if (!searchKeyword.value) return items.value
  const keyword = searchKeyword.value.toLowerCase()
  return items.value.filter(item => 
    item.partNo.toLowerCase().includes(keyword) || 
    item.partName.toLowerCase().includes(keyword)
  )
})

const totalItems = computed(() => items.value.length)
const totalQuantity = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
const lowStockCount = computed(() => lowStockItems.value.length)
const criticalLowCount = computed(() => inventoryStore.criticalLowItems.length)

const monthRecordCount = computed(() => {
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  return records.value.filter(r => r.createTime >= monthStart).length
})

const monthInboundCount = computed(() => {
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  return records.value.filter(r => r.createTime >= monthStart && r.type === 'inbound').length
})

const monthOutboundCount = computed(() => {
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  return records.value.filter(r => r.createTime >= monthStart && r.type === 'outbound').length
})

async function loadData() {
  await Promise.all([
    inventoryStore.loadItems(),
    inventoryStore.loadRecords()
  ])
}

async function loadRecords() {
  await inventoryStore.loadRecords()
}

function handleInbound(row: InventoryItem) {
  currentItem.value = row
  inboundForm.quantity = 1
  inboundForm.operator = ''
  inboundForm.reason = ''
  inboundDialogVisible.value = true
}

async function confirmInbound() {
  if (!currentItem.value) return
  
  try {
    await inboundFormRef.value?.validate()
    const success = await inventoryStore.inboundItem(
      currentItem.value!.id,
      inboundForm.quantity,
      inboundForm.operator,
      inboundForm.reason
    )
    if (success) {
      ElMessage.success(`成功入库 ${inboundForm.quantity} ${currentItem.value!.unit}`)
      inboundDialogVisible.value = false
    } else {
      ElMessage.error('入库失败')
    }
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  }
}

function handleOutbound(row: InventoryItem) {
  if (row.quantity <= 0) {
    ElMessage.warning('当前库存为0，无法出库')
    return
  }
  currentItem.value = row
  outboundForm.quantity = 1
  outboundForm.operator = ''
  outboundForm.reason = ''
  outboundDialogVisible.value = true
}

async function confirmOutbound() {
  if (!currentItem.value) return
  
  try {
    await outboundFormRef.value?.validate()
    const success = await inventoryStore.outboundItem(
      currentItem.value!.id,
      outboundForm.quantity,
      outboundForm.operator,
      outboundForm.reason
    )
    if (success) {
      ElMessage.success(`成功出库 ${outboundForm.quantity} ${currentItem.value!.unit}`)
      outboundDialogVisible.value = false
    } else {
      ElMessage.error('出库失败，库存不足')
    }
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  }
}

function handleEdit(row: InventoryItem) {
  currentItem.value = row
  editForm.quantity = row.quantity
  editForm.safeStock = row.safeStock
  editForm.minStock = row.minStock
  editForm.location = row.location
  editDialogVisible.value = true
}

async function confirmEdit() {
  if (!currentItem.value) return
  
  try {
    await editFormRef.value?.validate()
    await inventoryStore.updateItem(currentItem.value!.id, {
      ...currentItem.value,
      quantity: editForm.quantity,
      safeStock: editForm.safeStock,
      minStock: editForm.minStock,
      location: editForm.location
    })
    ElMessage.success('库存调整成功')
    editDialogVisible.value = false
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  }
}

async function handleViewRecords(row: InventoryItem) {
  currentItem.value = row
  partRecords.value = await inventoryStore.loadRecords(row.id)
  recordsDialogVisible.value = true
}

onMounted(loadData)
</script>

<style scoped>
.low-stock-list {
  margin-top: 8px;
}

.text-danger {
  color: #f56c6c;
}

.text-warning {
  color: #e6a23c;
}

.text-success {
  color: #67c23a;
}

.text-primary {
  color: #409eff;
}
</style>
