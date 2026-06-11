<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-left">
        <el-icon class="logo-icon" :size="32" color="#409EFF"><Watermelon /></el-icon>
        <div class="header-title">
          <h1>城市排水防涝与泵站智能调度系统</h1>
          <p class="subtitle">Urban Drainage & Pumping Station Intelligent Dispatch System</p>
        </div>
      </div>
      <div class="header-center">
        <el-tag v-if="weatherToday" :type="weatherType" size="large" effect="dark" class="weather-tag">
          <el-icon><Sunny /></el-icon>
          {{ weatherToday.forecastDate }} 气温 {{ weatherToday.temperature.toFixed(0) }}°C  降雨量 {{ weatherToday.rainfall.toFixed(1) }}mm
          <span v-if="weatherToday.tideLevel !== undefined">| 潮位 {{ weatherToday.tideLevel.toFixed(2) }}m</span>
        </el-tag>
      </div>
      <div class="header-right">
        <el-badge :value="unacknowledgedAlerts" :hidden="unacknowledgedAlerts === 0" class="alert-badge" type="danger">
          <el-button @click="goToMonitoring" type="warning" :icon="Bell">
            实时报警
          </el-button>
        </el-badge>
        <el-dropdown>
          <div class="user-info">
            <el-avatar :size="36" icon="UserFilled" />
            <div class="user-detail">
              <span class="username">{{ currentUser.name }}</span>
              <span class="role">{{ roleText }}</span>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人设置</el-dropdown-item>
              <el-dropdown-item divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <el-aside width="220px" class="app-aside">
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#001529"
          text-color="#b0c4de"
          active-text-color="#409EFF"
          class="side-menu"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>运行总览</span>
          </el-menu-item>
          <el-menu-item index="/pumps">
            <el-icon><Setting /></el-icon>
            <span>泵站信息管理</span>
          </el-menu-item>
          <el-menu-item index="/schedules">
            <el-icon><Calendar /></el-icon>
            <span>调度方案管理</span>
          </el-menu-item>
          <el-menu-item index="/monitoring">
            <el-icon><Odometer /></el-icon>
            <span>实时运行监测</span>
          </el-menu-item>
          <el-menu-item index="/alerts">
            <el-icon><Warning /></el-icon>
            <span>报警事件中心</span>
          </el-menu-item>
          <el-menu-item index="/maintenance">
            <el-icon><Tools /></el-icon>
            <span>设备维保管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <el-icon><Goods /></el-icon>
            <span>备件库存管理</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><Histogram /></el-icon>
            <span>统计报表分析</span>
          </el-menu-item>
          <el-menu-item index="/topology">
            <el-icon><Share /></el-icon>
            <span>管网拓扑图</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { Bell, Sunny, Watermelon, DataAnalysis, Setting, Calendar, Odometer, Warning, Tools, Goods, Histogram, Share } from '@element-plus/icons-vue'
import type { WeatherForecast, Alert, User } from './types'
import dayjs from 'dayjs'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)
const weatherToday = ref<WeatherForecast | null>(null)
const unacknowledgedAlerts = ref(0)
const alerts = ref<Alert[]>([])
let alertInterval: number | null = null

const currentUser = ref<User>({
  id: 1,
  username: 'admin',
  name: '系统管理员',
  role: 'admin',
  permissions: ['*']
})

const roleText = computed(() => {
  const map: Record<string, string> = {
    admin: '系统管理员',
    manager: '水务主管',
    operator: '值班员',
    maintenance: '维修人员'
  }
  return map[currentUser.value.role] || '未知'
})

const weatherType = computed(() => {
  if (!weatherToday.value) return 'info'
  const intensity = weatherToday.value.rainfallIntensity
  if (intensity === 'storm') return 'danger'
  if (intensity === 'heavy') return 'warning'
  if (intensity === 'moderate') return 'success'
  return 'info'
})

async function loadWeather() {
  try {
    const list = await api.weather.forecast()
    weatherToday.value = list[0] || null
  } catch (e) {
    console.error('加载天气数据失败', e)
  }
}

async function loadAlerts() {
  try {
    const list = await api.monitoring.alerts()
    alerts.value = list
    const oldCount = unacknowledgedAlerts.value
    unacknowledgedAlerts.value = list.filter((a: Alert) => !a.acknowledged).length

    if (unacknowledgedAlerts.value > oldCount) {
      const newAlerts = list.filter((a: Alert) => !a.acknowledged)
      if (newAlerts.length > 0) {
        const latest = newAlerts[0]
        ElNotification({
          title: `${latest.alertLevel === 'critical' ? '紧急' : latest.alertLevel === 'danger' ? '危险' : '警告'}报警`,
          message: latest.message,
          type: latest.alertLevel === 'critical' || latest.alertLevel === 'danger' ? 'error' : 'warning',
          duration: 5000
        })
      }
    }
  } catch (e) {
    console.error('加载报警数据失败', e)
  }
}

function goToMonitoring() {
  router.push('/monitoring')
}

onMounted(() => {
  loadWeather()
  loadAlerts()
  alertInterval = window.setInterval(loadAlerts, 10000)
})

onUnmounted(() => {
  if (alertInterval) clearInterval(alertInterval)
})
</script>

<style>
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #001529 0%, #003366 100%);
  color: white;
  padding: 0 24px;
  height: 72px;
  border-bottom: 1px solid #1890ff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.header-title h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 2px;
}

.subtitle {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: #8c8c8c;
  letter-spacing: 1px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.weather-tag {
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.alert-badge {
  margin-right: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-detail {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.username {
  font-size: 14px;
  font-weight: 500;
}

.role {
  font-size: 11px;
  color: #8c8c8c;
}

.app-aside {
  background: #001529;
  border-right: 1px solid #000c17;
}

.side-menu {
  height: calc(100vh - 72px);
  border-right: none;
}

.side-menu :deep(.el-menu-item) {
  height: 52px;
  line-height: 52px;
  margin: 4px 8px;
  border-radius: 6px;
}

.side-menu :deep(.el-menu-item:hover) {
  background: rgba(64, 158, 255, 0.1);
}

.side-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.2) 0%, rgba(64, 158, 255, 0.05) 100%);
  border-left: 3px solid #409EFF;
}

.app-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
