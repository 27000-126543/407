<template>
  <div class="pump-management">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><OfficeBuilding /></el-icon>
        泵站信息管理
      </h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增泵站
        </el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="泵站名称">
          <el-input v-model="filterForm.name" placeholder="请输入泵站名称" clearable />
        </el-form-item>
        <el-form-item label="流域">
          <el-select v-model="filterForm.basin" placeholder="请选择流域" clearable>
            <el-option label="东湖流域" value="东湖流域" />
            <el-option label="西湖流域" value="西湖流域" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="运行中" value="running" />
            <el-option label="待机" value="standby" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="故障" value="fault" />
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
      <el-table :data="filteredPumps" stripe border class="data-table" v-loading="loading">
        <el-table-column prop="name" label="泵站名称" min-width="120" />
        <el-table-column prop="code" label="泵站编号" min-width="120" />
        <el-table-column prop="location" label="位置" min-width="150" />
        <el-table-column prop="basin" label="流域" min-width="100" />
        <el-table-column prop="designFlow" label="设计流量(m³/h)" min-width="120">
          <template #default="{ row }">{{ row.designFlow }}</template>
        </el-table-column>
        <el-table-column prop="head" label="扬程(m)" min-width="80" />
        <el-table-column prop="power" label="功率(kW)" min-width="80" />
        <el-table-column prop="equipmentModel" label="设备型号" min-width="120" />
        <el-table-column label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">详情</el-button>
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form
        ref="pumpFormRef"
        :model="pumpForm"
        :rules="pumpRules"
        label-width="120px"
        class="pump-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="泵站名称" prop="name">
              <el-input v-model="pumpForm.name" placeholder="请输入泵站名称" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="泵站编号" prop="code">
              <el-input v-model="pumpForm.code" placeholder="请输入泵站编号" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="位置" prop="location">
              <el-input v-model="pumpForm.location" placeholder="请输入位置" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="流域" prop="basin">
              <el-select v-model="pumpForm.basin" placeholder="请选择流域" style="width: 100%" :disabled="isViewMode">
                <el-option label="东湖流域" value="东湖流域" />
                <el-option label="西湖流域" value="西湖流域" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number v-model="pumpForm.longitude" :precision="6" :step="0.000001" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number v-model="pumpForm.latitude" :precision="6" :step="0.000001" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="设计流量" prop="designFlow">
              <el-input-number v-model="pumpForm.designFlow" :min="0" :step="10" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="扬程(m)" prop="head">
              <el-input-number v-model="pumpForm.head" :min="0" :step="0.1" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="功率(kW)" prop="power">
              <el-input-number v-model="pumpForm.power" :min="0" :step="1" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备型号" prop="equipmentModel">
              <el-input v-model="pumpForm.equipmentModel" placeholder="请输入设备型号" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="pumpForm.manufacturer" placeholder="请输入生产厂家" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安装日期" prop="installDate">
              <el-date-picker
                v-model="pumpForm.installDate"
                type="date"
                placeholder="选择安装日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                :disabled="isViewMode"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="pumpForm.status" placeholder="请选择状态" style="width: 100%" :disabled="isViewMode">
                <el-option label="运行中" value="running" />
                <el-option label="待机" value="standby" />
                <el-option label="维护中" value="maintenance" />
                <el-option label="故障" value="fault" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="额定电流(A)" prop="ratedCurrent">
              <el-input-number v-model="pumpForm.ratedCurrent" :min="0" :step="0.1" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最大电流(A)" prop="maxCurrent">
              <el-input-number v-model="pumpForm.maxCurrent" :min="0" :step="0.1" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="前池预警水位(m)" prop="forebayWarningLevel">
              <el-input-number v-model="pumpForm.forebayWarningLevel" :min="0" :step="0.01" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="前池危险水位(m)" prop="forebayDangerLevel">
              <el-input-number v-model="pumpForm.forebayDangerLevel" :min="0" :step="0.01" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上游泵站" prop="upstreamPumpIds">
              <el-select
                v-model="pumpForm.upstreamPumpIds"
                multiple
                placeholder="请选择上游泵站"
                style="width: 100%"
                :disabled="isViewMode"
              >
                <el-option
                  v-for="pump in availableUpstreamPumps"
                  :key="pump.id"
                  :label="pump.name"
                  :value="pump.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下游泵站" prop="downstreamPumpIds">
              <el-select
                v-model="pumpForm.downstreamPumpIds"
                multiple
                placeholder="请选择下游泵站"
                style="width: 100%"
                :disabled="isViewMode"
              >
                <el-option
                  v-for="pump in availableDownstreamPumps"
                  :key="pump.id"
                  :label="pump.name"
                  :value="pump.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="!isViewMode" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      title="泵站详情"
      width="800px"
    >
      <el-descriptions :column="2" border v-if="currentPump">
        <el-descriptions-item label="泵站名称">{{ currentPump.name }}</el-descriptions-item>
        <el-descriptions-item label="泵站编号">{{ currentPump.code }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ currentPump.location }}</el-descriptions-item>
        <el-descriptions-item label="流域">{{ currentPump.basin }}</el-descriptions-item>
        <el-descriptions-item label="经纬度">{{ currentPump.longitude }}, {{ currentPump.latitude }}</el-descriptions-item>
        <el-descriptions-item label="设计流量">{{ currentPump.designFlow }} m³/h</el-descriptions-item>
        <el-descriptions-item label="扬程">{{ currentPump.head }} m</el-descriptions-item>
        <el-descriptions-item label="功率">{{ currentPump.power }} kW</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ currentPump.equipmentModel }}</el-descriptions-item>
        <el-descriptions-item label="生产厂家">{{ currentPump.manufacturer }}</el-descriptions-item>
        <el-descriptions-item label="安装日期">{{ currentPump.installDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentPump.status)" size="small">
            {{ getStatusText(currentPump.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="额定电流">{{ currentPump.ratedCurrent }} A</el-descriptions-item>
        <el-descriptions-item label="最大电流">{{ currentPump.maxCurrent }} A</el-descriptions-item>
        <el-descriptions-item label="前池预警水位">{{ currentPump.forebayWarningLevel }} m</el-descriptions-item>
        <el-descriptions-item label="前池危险水位">{{ currentPump.forebayDangerLevel }} m</el-descriptions-item>
        <el-descriptions-item label="上游泵站" :span="2">
          <el-tag v-for="id in currentPump.upstreamPumpIds" :key="id" size="small" style="margin-right: 5px;">
            {{ getPumpName(id) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下游泵站" :span="2">
          <el-tag v-for="id in currentPump.downstreamPumpIds" :key="id" size="small" style="margin-right: 5px;">
            {{ getPumpName(id) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="累计运行时间">{{ currentPump.totalRuntime }} 小时</el-descriptions-item>
        <el-descriptions-item label="启动次数">{{ currentPump.startCount }} 次</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(currentPump.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(currentPump.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { OfficeBuilding, Plus, Search, Refresh } from '@element-plus/icons-vue'
import { usePumpStore } from '@/stores'
import { getStatusText, formatDateTime } from '@/utils'
import type { Pump } from '@/types'

const pumpStore = usePumpStore()

const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isViewMode = ref(false)
const isEditMode = ref(false)
const currentPump = ref<Pump | null>(null)
const pumpFormRef = ref<FormInstance>()

const filterForm = reactive({
  name: '',
  basin: '',
  status: ''
})

const pumpForm = reactive<Partial<Pump>>({
  name: '',
  code: '',
  location: '',
  longitude: 0,
  latitude: 0,
  basin: '',
  designFlow: 0,
  head: 0,
  power: 0,
  equipmentModel: '',
  manufacturer: '',
  installDate: '',
  ratedCurrent: 0,
  maxCurrent: 0,
  forebayWarningLevel: 0,
  forebayDangerLevel: 0,
  upstreamPumpIds: [],
  downstreamPumpIds: [],
  status: 'standby'
})

const pumpRules: FormRules = {
  name: [{ required: true, message: '请输入泵站名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入泵站编号', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
  basin: [{ required: true, message: '请选择流域', trigger: 'change' }],
  longitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
  latitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }],
  designFlow: [{ required: true, message: '请输入设计流量', trigger: 'blur' }],
  head: [{ required: true, message: '请输入扬程', trigger: 'blur' }],
  power: [{ required: true, message: '请输入功率', trigger: 'blur' }],
  equipmentModel: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const dialogTitle = computed(() => {
  if (isViewMode.value) return '查看泵站'
  if (isEditMode.value) return '编辑泵站'
  return '新增泵站'
})

const filteredPumps = computed(() => {
  let result = pumpStore.pumps
  if (filterForm.name) {
    result = result.filter(p => p.name.includes(filterForm.name))
  }
  if (filterForm.basin) {
    result = result.filter(p => p.basin === filterForm.basin)
  }
  if (filterForm.status) {
    result = result.filter(p => p.status === filterForm.status)
  }
  return result
})

const availableUpstreamPumps = computed(() => {
  return pumpStore.pumps.filter(p => p.id !== currentPump.value?.id)
})

const availableDownstreamPumps = computed(() => {
  return pumpStore.pumps.filter(p => p.id !== currentPump.value?.id)
})

function getStatusType(status: string): string {
  const map: Record<string, string> = {
    running: 'success',
    standby: 'info',
    maintenance: 'warning',
    fault: 'danger'
  }
  return map[status] || 'info'
}

function getPumpName(id: number): string {
  const pump = pumpStore.pumps.find(p => p.id === id)
  return pump?.name || '未知'
}

function handleSearch() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

function handleReset() {
  filterForm.name = ''
  filterForm.basin = ''
  filterForm.status = ''
  handleSearch()
}

function handleAdd() {
  isViewMode.value = false
  isEditMode.value = false
  currentPump.value = null
  resetPumpForm()
  dialogVisible.value = true
}

function handleEdit(row: Pump) {
  isViewMode.value = false
  isEditMode.value = true
  currentPump.value = row
  Object.assign(pumpForm, row)
  dialogVisible.value = true
}

function handleView(row: Pump) {
  isViewMode.value = true
  isEditMode.value = false
  currentPump.value = row
  detailDialogVisible.value = true
}

async function handleDelete(row: Pump) {
  try {
    await ElMessageBox.confirm(
      `确定要删除泵站"${row.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await pumpStore.deletePump(row.id)
    ElMessage.success('删除成功')
  } catch {
  }
}

function handleDialogClosed() {
  resetPumpForm()
  pumpFormRef.value?.resetFields()
}

function resetPumpForm() {
  Object.assign(pumpForm, {
    name: '',
    code: '',
    location: '',
    longitude: 0,
    latitude: 0,
    basin: '',
    designFlow: 0,
    head: 0,
    power: 0,
    equipmentModel: '',
    manufacturer: '',
    installDate: '',
    ratedCurrent: 0,
    maxCurrent: 0,
    forebayWarningLevel: 0,
    forebayDangerLevel: 0,
    upstreamPumpIds: [],
    downstreamPumpIds: [],
    status: 'standby'
  })
}

async function handleSubmit() {
  if (!pumpFormRef.value) return
  
  await pumpFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEditMode.value && currentPump.value) {
          await pumpStore.updatePump(currentPump.value.id, pumpForm)
          ElMessage.success('更新成功')
        } else {
          await pumpStore.createPump(pumpForm)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
  })
}

async function init() {
  loading.value = true
  try {
    await pumpStore.loadPumps()
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(init)
</script>

<style scoped>
.pump-management {
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

.pump-form {
  padding-right: 20px;
}
</style>
