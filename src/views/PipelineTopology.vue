<template>
  <div class="page-container" style="display: flex; flex-direction: column; height: calc(100vh - 112px); padding: 0;">
    <div style="background: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <h2 class="page-title" style="margin: 0;">
        <el-icon><Share /></el-icon>
        管网拓扑图
      </h2>
      <div class="topology-controls">
        <el-radio-group v-model="displayMode" size="small">
          <el-radio-button value="status">泵站状态</el-radio-button>
          <el-radio-button value="level">水位热力</el-radio-button>
          <el-radio-button value="flow">流量分布</el-radio-button>
        </el-radio-group>
        <el-button :icon="Refresh" size="small" @click="refreshData" style="margin-left: 12px;">刷新数据</el-button>
        <el-button :icon="FullScreen" size="small" @click="toggleFullscreen">全屏</el-button>
      </div>
    </div>

    <div style="display: flex; flex: 1; gap: 16px; min-height: 0;">
      <div style="flex: 1; background: white; border-radius: 8px; padding: 16px; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <el-tag type="primary" size="small" style="margin-right: 8px;">
              <el-icon><LocationInformation /></el-icon>
              共 {{ nodes.length }} 个节点
            </el-tag>
            <el-tag type="success" size="small" style="margin-right: 8px;">
              <el-icon><Operation /></el-icon>
              {{ runningPumps }} 台运行中
            </el-tag>
            <el-tag v-if="highLevelCount > 0" type="danger" size="small">
              <el-icon><Warning /></el-icon>
              {{ highLevelCount }} 个高水位节点
            </el-tag>
          </div>
          <div style="display: flex; gap: 16px; align-items: center;">
            <template v-if="displayMode === 'level'">
              <div class="legend-item">
                <span class="legend-color" style="background: #67C23A;"></span>
                <span>正常</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #E6A23C;"></span>
                <span>偏高</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #F56C6C;"></span>
                <span>超高</span>
              </div>
            </template>
            <template v-if="displayMode === 'status'">
              <div class="legend-item">
                <span class="legend-dot" style="background: #67C23A;"></span>
                <span>运行</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #409EFF;"></span>
                <span>待机</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #E6A23C;"></span>
                <span>维护</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #F56C6C;"></span>
                <span>故障</span>
              </div>
            </template>
          </div>
        </div>
        <div ref="topologyContainer" style="flex: 1; min-height: 0; border-radius: 8px; overflow: hidden; position: relative;">
          <svg ref="svgRef" :width="svgWidth" :height="svgHeight" @click="onCanvasClick">
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#409EFF" stop-opacity="0.3" />
                <stop offset="50%" stop-color="#409EFF" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#409EFF" stop-opacity="0.3" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g v-for="node in nodes" :key="'line-' + node.id">
              <line
                v-for="targetId in node.connectedNodes"
                :key="'conn-' + node.id + '-' + targetId"
                :x1="getDisplayX(node.longitude)"
                :y1="getDisplayY(node.latitude)"
                :x2="getDisplayX(getNodeById(targetId)?.longitude || 0)"
                :y2="getDisplayY(getNodeById(targetId)?.latitude || 0)"
                :stroke="getConnectionColor(node, getNodeById(targetId))"
                :stroke-width="getConnectionWidth(node, getNodeById(targetId))"
                stroke-opacity="0.6"
              >
                <animate
                  v-if="displayMode === 'flow' && isAnimated(node, targetId)"
                  attributeName="stroke-dashoffset"
                  from="20"
                  to="0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </line>
            </g>

            <g
              v-for="node in nodes"
              :key="'node-' + node.id"
              :transform="`translate(${getDisplayX(node.longitude)}, ${getDisplayY(node.latitude)})`"
              @click.stop="selectNode(node)"
              class="node-group"
              :class="{ selected: selectedNode?.id === node.id }"
              style="cursor: pointer;"
            >
              <circle
                :r="getNodeRadius(node)"
                :fill="getNodeColor(node)"
                :stroke="selectedNode?.id === node.id ? '#fff' : 'transparent'"
                stroke-width="3"
                filter="url(#glow)"
                class="node-circle"
              />
              <circle
                v-if="node.type === 'pump'"
                :r="getNodeRadius(node) * 0.6"
                fill="rgba(255,255,255,0.3)"
              />
              <text
                v-if="node.type === 'pump'"
                text-anchor="middle"
                dominant-baseline="central"
                fill="#fff"
                font-size="14"
                font-weight="bold"
              >
                泵
              </text>
              <text
                v-else-if="node.type === 'outfall'"
                text-anchor="middle"
                dominant-baseline="central"
                fill="#fff"
                font-size="12"
                font-weight="bold"
              >
                排
              </text>
              <text
                v-else-if="node.type === 'reservoir'"
                text-anchor="middle"
                dominant-baseline="central"
                fill="#fff"
                font-size="12"
                font-weight="bold"
              >
                调
              </text>

              <text
                :y="getNodeRadius(node) + 18"
                text-anchor="middle"
                fill="#333"
                font-size="11"
                font-weight="500"
              >
                {{ node.name }}
              </text>

              <text
                v-if="displayMode === 'level'"
                :y="-getNodeRadius(node) - 8"
                text-anchor="middle"
                :fill="getLevelColor((node.currentLevel || 0), node.maxLevel, node.warningLevel)"
                font-size="11"
                font-weight="bold"
              >
                {{ (node.currentLevel || 0).toFixed(2) }}m
              </text>

              <text
                v-if="node.type === 'pump' && displayMode === 'status'"
                :y="-getNodeRadius(node) - 8"
                text-anchor="middle"
                :fill="getPumpStatusColor(node)"
                font-size="10"
                font-weight="bold"
              >
                {{ getPumpStatusText(node) }}
              </text>

              <el-badge
                v-if="hasAlert(node)"
                :value="1"
                type="danger"
                class="node-badge"
              />
            </g>

            <g v-for="(heat, idx) in heatmapCells" :key="'heat-' + idx">
              <rect
                :x="heat.x"
                :y="heat.y"
                :width="30"
                :height="30"
                :fill="heat.color"
                fill-opacity="0.3"
                rx="4"
              />
            </g>
          </svg>
        </div>
      </div>

      <div style="width: 340px; display: flex; flex-direction: column; gap: 16px;">
        <div style="background: white; border-radius: 8px; padding: 16px;">
          <h3 class="chart-title" style="margin-bottom: 12px;">节点详情</h3>
          <div v-if="selectedNode" class="node-detail">
            <div class="detail-header">
              <el-tag :type="getNodeTypeTag(selectedNode.type)" size="large">
                {{ getNodeTypeName(selectedNode.type) }}
              </el-tag>
              <h4 style="margin: 8px 0;">{{ selectedNode.name }}</h4>
              <p style="color: #909399; font-size: 12px; margin: 0;">编号: {{ selectedNode.code }}</p>
            </div>

            <el-descriptions :column="1" border size="small" style="margin-top: 12px;">
              <el-descriptions-item label="当前水位">
                <span :style="{ color: getLevelColor((selectedNode.currentLevel || 0), selectedNode.maxLevel, selectedNode.warningLevel), fontWeight: 'bold' }">
                  {{ (selectedNode.currentLevel || 0).toFixed(2) }} m
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="警戒水位">
                {{ selectedNode.warningLevel.toFixed(2) }} m
              </el-descriptions-item>
              <el-descriptions-item label="最大水位">
                {{ selectedNode.maxLevel.toFixed(2) }} m
              </el-descriptions-item>
              <el-descriptions-item label="水位占比">
                <el-progress
                  :percentage="Math.round(((selectedNode.currentLevel || 0) / selectedNode.maxLevel) * 100)"
                  :color="getProgressColor(selectedNode)"
                  :stroke-width="12"
                />
              </el-descriptions-item>
              <el-descriptions-item label="连通节点">
                {{ selectedNode.connectedNodes.map(id => getNodeById(id)?.name).join('、') || '无' }}
              </el-descriptions-item>
              <el-descriptions-item label="坐标">
                {{ selectedNode.longitude.toFixed(4) }}, {{ selectedNode.latitude.toFixed(4) }}
              </el-descriptions-item>
            </el-descriptions>

            <div v-if="selectedNode.type === 'pump'" style="margin-top: 16px;">
              <h4 style="margin: 0 0 8px 0; font-size: 14px;">泵站运行数据</h4>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="流量">
                  {{ getPumpFlow(selectedNode)?.toFixed(1) || 0 }} m³/h
                </el-descriptions-item>
                <el-descriptions-item label="电流">
                  {{ getPumpCurrent(selectedNode)?.toFixed(1) || 0 }} A
                </el-descriptions-item>
                <el-descriptions-item label="扬程">
                  {{ getPumpHead(selectedNode)?.toFixed(1) || 0 }} m
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getPumpStatusTag(selectedNode)" size="small">
                    {{ getPumpStatusText(selectedNode) }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <div v-if="hasAlert(selectedNode)" style="margin-top: 16px;">
              <el-alert title="该节点存在报警" type="error" :closable="false" show-icon size="small" />
            </div>
          </div>
          <div v-else class="empty-detail">
            <el-empty description="点击节点查看详情" :image-size="80" />
          </div>
        </div>

        <div style="background: white; border-radius: 8px; padding: 16px; flex: 1; overflow-y: auto;">
          <h3 class="chart-title" style="margin-bottom: 12px;">泵站状态列表</h3>
          <el-table :data="pumpNodes" size="small" stripe>
            <el-table-column prop="name" label="泵站名称" width="120" />
            <el-table-column label="水位(m)" width="90">
              <template #default="{ row }">
                <span :style="{ color: getLevelColor((row.currentLevel || 0), row.maxLevel, row.warningLevel) }">
                  {{ (row.currentLevel || 0).toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="70">
              <template #default="{ row }">
                <span :class="`status-tag-${getPumpActualStatus(row)}`" style="padding: 2px 8px;">
                  {{ getPumpStatusText(row) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="流量" width="80">
              <template #default="{ row }">
                {{ getPumpFlow(row)?.toFixed(0) || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="50">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="selectNode(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Share, Refresh, FullScreen, LocationInformation, Operation, Warning } from '@element-plus/icons-vue'
import { useTopologyStore, usePumpStore, useMonitoringStore } from '@/stores'
import { getLevelColor } from '@/utils'
import type { PipelineNode, Pump } from '@/types'

const topologyStore = useTopologyStore()
const pumpStore = usePumpStore()
const monitoringStore = useMonitoringStore()

const topologyContainer = ref<HTMLElement>()
const svgRef = ref<SVGSVGElement>()
const svgWidth = ref(800)
const svgHeight = ref(600)

const displayMode = ref('status')
const selectedNode = ref<PipelineNode | null>(null)
const nodes = ref<PipelineNode[]>([])
const pumps = ref<Pump[]>([])
const realtimeData = ref<Map<number, any>>(new Map())
let refreshInterval: number | null = null

const runningPumps = computed(() => {
  return nodes.value.filter(n => n.type === 'pump' && getPumpActualStatus(n) === 'running').length
})

const highLevelCount = computed(() => {
  return nodes.value.filter(n => (n.currentLevel || 0) >= n.warningLevel).length
})

const pumpNodes = computed(() => nodes.value.filter(n => n.type === 'pump'))

const heatmapCells = computed(() => {
  if (displayMode.value !== 'level') return []

  const cells: { x: number; y: number; color: string }[] = []
  const step = 30

  for (let x = 0; x < svgWidth.value; x += step) {
    for (let y = 0; y < svgHeight.value; y += step) {
      let totalLevel = 0
      let totalWeight = 0

      for (const node of nodes.value) {
        const nx = getDisplayX(node.longitude)
        const ny = getDisplayY(node.latitude)
        const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2)
        if (dist < 150) {
          const weight = 1 - dist / 150
          const levelRatio = (node.currentLevel || 0) / node.maxLevel
          totalLevel += levelRatio * weight
          totalWeight += weight
        }
      }

      if (totalWeight > 0) {
        const avgLevel = totalLevel / totalWeight
        let color = '#67C23A'
        if (avgLevel > 0.85) color = '#F56C6C'
        else if (avgLevel > 0.7) color = '#E6A23C'
        else if (avgLevel > 0.5) color = '#F0C78A'

        cells.push({ x, y, color })
      }
    }
  }

  return cells
})

function getNodeById(id: number): PipelineNode | undefined {
  return nodes.value.find(n => n.id === id)
}

function getDisplayX(lon: number): number {
  const minLon = Math.min(...nodes.value.map(n => n.longitude))
  const maxLon = Math.max(...nodes.value.map(n => n.longitude))
  const range = maxLon - minLon || 1
  return 60 + ((lon - minLon) / range) * (svgWidth.value - 120)
}

function getDisplayY(lat: number): number {
  const minLat = Math.min(...nodes.value.map(n => n.latitude))
  const maxLat = Math.max(...nodes.value.map(n => n.latitude))
  const range = maxLat - minLat || 1
  return svgHeight.value - 60 - ((lat - minLat) / range) * (svgHeight.value - 120)
}

function getNodeRadius(node: PipelineNode): number {
  if (node.type === 'pump') return 24
  if (node.type === 'outfall') return 20
  if (node.type === 'reservoir') return 22
  return 14
}

function getNodeColor(node: PipelineNode): string {
  if (displayMode.value === 'level') {
    const level = node.currentLevel || 0
    const ratio = level / node.maxLevel
    if (level >= node.warningLevel) return '#F56C6C'
    if (ratio > 0.7) return '#E6A23C'
    if (ratio > 0.5) return '#F0C78A'
    return '#67C23A'
  }

  if (displayMode.value === 'status' && node.type === 'pump') {
    const status = getPumpActualStatus(node)
    if (status === 'running') return '#67C23A'
    if (status === 'standby') return '#409EFF'
    if (status === 'maintenance') return '#E6A23C'
    if (status === 'fault') return '#F56C6C'
  }

  if (displayMode.value === 'flow') {
    const flow = getPumpFlow(node) || 0
    if (flow > 800) return '#F56C6C'
    if (flow > 500) return '#E6A23C'
    if (flow > 200) return '#409EFF'
    return '#909399'
  }

  if (node.type === 'outfall') return '#13C2C2'
  if (node.type === 'reservoir') return '#722ED1'
  return '#909399'
}

function getConnectionColor(node1: PipelineNode, node2: PipelineNode | undefined): string {
  if (!node2) return '#dcdfe6'
  if (displayMode.value === 'level') {
    const maxLevel = Math.max(node1.currentLevel || 0, node2.currentLevel || 0)
    const maxWarning = Math.max(node1.warningLevel, node2.warningLevel)
    if (maxLevel >= maxWarning) return '#F56C6C'
    return '#67C23A'
  }
  return '#409EFF'
}

function getConnectionWidth(node1: PipelineNode, node2: PipelineNode | undefined): number {
  if (displayMode.value === 'flow') {
    const f1 = getPumpFlow(node1) || 0
    const f2 = node2 ? (getPumpFlow(node2) || 0) : 0
    const avgFlow = (f1 + f2) / 2
    return Math.max(2, Math.min(6, avgFlow / 200))
  }
  return 2
}

function isAnimated(node: PipelineNode, targetId: number): boolean {
  const target = getNodeById(targetId)
  if (!target) return false
  return (node.currentLevel || 0) > (target.currentLevel || 0)
}

function getNodeTypeTag(type: string): string {
  const map: Record<string, string> = {
    pump: 'primary',
    manhole: 'info',
    outfall: 'success',
    reservoir: 'warning'
  }
  return map[type] || 'info'
}

function getNodeTypeName(type: string): string {
  const map: Record<string, string> = {
    pump: '泵站',
    manhole: '检查井',
    outfall: '排放口',
    reservoir: '调蓄池'
  }
  return map[type] || type
}

function findPumpByNode(node: PipelineNode): Pump | undefined {
  return pumps.value.find(p => p.code === node.code || p.name === node.name)
}

function getPumpActualStatus(node: PipelineNode): string {
  const pump = findPumpByNode(node)
  if (pump) return pump.status
  const data = realtimeData.value.get(node.id)
  if (data && data.flow > 0) return 'running'
  return 'standby'
}

function getPumpStatusText(node: PipelineNode): string {
  const status = getPumpActualStatus(node)
  const map: Record<string, string> = {
    running: '运行',
    standby: '待机',
    maintenance: '维护',
    fault: '故障'
  }
  return map[status] || status
}

function getPumpStatusColor(node: PipelineNode): string {
  const status = getPumpActualStatus(node)
  const map: Record<string, string> = {
    running: '#67C23A',
    standby: '#409EFF',
    maintenance: '#E6A23C',
    fault: '#F56C6C'
  }
  return map[status] || '#909399'
}

function getPumpStatusTag(node: PipelineNode): string {
  const status = getPumpActualStatus(node)
  const map: Record<string, string> = {
    running: 'success',
    standby: 'primary',
    maintenance: 'warning',
    fault: 'danger'
  }
  return map[status] || 'info'
}

function getPumpFlow(node: PipelineNode): number {
  const pump = findPumpByNode(node)
  if (pump) {
    const data = realtimeData.value.get(pump.id)
    if (data && typeof data.flow === 'number') return data.flow
    if (pump.units && pump.units.length > 0) {
      return pump.units.reduce((sum: number, u: any) => sum + (u.flow || 0), 0)
    }
    if (pump.status === 'running') return Math.round(pump.designFlow * 0.7)
  }
  return 0
}

function getPumpCurrent(node: PipelineNode): number {
  const pump = findPumpByNode(node)
  if (pump) {
    const data = realtimeData.value.get(pump.id)
    if (data && typeof data.current === 'number') return data.current
    if (pump.units && pump.units.length > 0) {
      return pump.units.reduce((sum: number, u: any) => sum + (u.current || 0), 0)
    }
    if (pump.status === 'running') return Math.round(pump.ratedCurrent * 0.85)
  }
  return 0
}

function getPumpHead(node: PipelineNode): number {
  const pump = findPumpByNode(node)
  if (pump) {
    const data = realtimeData.value.get(pump.id)
    if (data && typeof data.head === 'number') return data.head
    if (pump.units && pump.units.length > 0) {
      const running = pump.units.find((u: any) => u.status === 'running')
      if (running) return running.head || pump.head
    }
    return pump.head
  }
  return 0
}

function getProgressColor(node: PipelineNode): string {
  const ratio = (node.currentLevel || 0) / node.maxLevel
  if (node.currentLevel && node.currentLevel >= node.warningLevel) return '#F56C6C'
  if (ratio > 0.7) return '#E6A23C'
  return '#67C23A'
}

function hasAlert(node: PipelineNode): boolean {
  return node.type === 'pump' && (node.currentLevel || 0) >= node.warningLevel
}

function selectNode(node: PipelineNode) {
  selectedNode.value = node
}

function onCanvasClick() {
  selectedNode.value = null
}

async function refreshData() {
  try {
    nodes.value = await topologyStore.loadNodes()
    pumps.value = pumpStore.pumps

    for (const pump of pumps.value) {
      const data = await monitoringStore.loadRealtime(pump.id)
      if (data) {
        realtimeData.value.set(pump.id, data)
      }
    }

    for (const node of nodes.value) {
      const pump = pumps.value.find(p => p.code === node.code || p.name === node.name)
      if (pump) {
        const data = realtimeData.value.get(pump.id)
        if (data) {
          node.currentLevel = data.forebayLevel
        }
      }
    }
  } catch (e) {
    console.error('刷新数据失败', e)
  }
}

function updateSvgSize() {
  if (topologyContainer.value) {
    svgWidth.value = topologyContainer.value.clientWidth
    svgHeight.value = topologyContainer.value.clientHeight
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    topologyContainer.value?.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await pumpStore.loadPumps()
  await refreshData()

  await nextTick()
  updateSvgSize()

  resizeObserver = new ResizeObserver(updateSvgSize)
  if (topologyContainer.value) {
    resizeObserver.observe(topologyContainer.value)
  }

  refreshInterval = window.setInterval(refreshData, 5000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped>
.topology-controls {
  display: flex;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.node-group:hover .node-circle {
  opacity: 0.8;
  transform: scale(1.1);
  transform-origin: center;
}

.node-circle {
  transition: all 0.2s ease;
}

.node-group.selected .node-circle {
  stroke-width: 4;
}

.node-detail {
  animation: fadeIn 0.3s ease;
}

.empty-detail {
  padding: 40px 0;
}

.detail-header {
  text-align: center;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.detail-header h4 {
  font-size: 16px;
  color: #303133;
}

.node-badge {
  position: absolute;
  transform: translate(15px, -15px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
