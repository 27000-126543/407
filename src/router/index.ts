import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '运行总览' }
  },
  {
    path: '/pumps',
    name: 'Pumps',
    component: () => import('@/views/PumpManagement.vue'),
    meta: { title: '泵站信息管理' }
  },
  {
    path: '/schedules',
    name: 'Schedules',
    component: () => import('@/views/ScheduleManagement.vue'),
    meta: { title: '调度方案管理' }
  },
  {
    path: '/monitoring',
    name: 'Monitoring',
    component: () => import('@/views/RealtimeMonitoring.vue'),
    meta: { title: '实时运行监测' }
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: () => import('@/views/AlertCenter.vue'),
    meta: { title: '报警事件中心' }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/MaintenanceManagement.vue'),
    meta: { title: '设备维保管理' }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/InventoryManagement.vue'),
    meta: { title: '备件库存管理' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/StatisticsReport.vue'),
    meta: { title: '统计报表分析' }
  },
  {
    path: '/topology',
    name: 'Topology',
    component: () => import('@/views/PipelineTopology.vue'),
    meta: { title: '管网拓扑图' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 城市排水防涝与泵站智能调度系统` : '城市排水防涝与泵站智能调度系统'
  next()
})

export default router
