import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pump, Schedule, Alert, MaintenanceOrder, InventoryItem, InventoryRecord, WeatherForecast, PipelineNode, MonitoringData } from '@/types'
import api from '@/utils/api'

export const usePumpStore = defineStore('pump', () => {
  const pumps = ref<Pump[]>([])
  const selectedPump = ref<Pump | null>(null)

  async function loadPumps() {
    pumps.value = await api.pump.list()
  }

  async function loadPump(id: number) {
    selectedPump.value = await api.pump.get(id)
    return selectedPump.value
  }

  async function createPump(data: any) {
    const id = await api.pump.create(data)
    await loadPumps()
    return id
  }

  async function updatePump(id: number, data: any) {
    await api.pump.update(id, data)
    await loadPumps()
  }

  async function deletePump(id: number) {
    await api.pump.delete(id)
    await loadPumps()
  }

  return { pumps, selectedPump, loadPumps, loadPump, createPump, updatePump, deletePump }
})

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref<Schedule[]>([])
  const selectedSchedule = ref<Schedule | null>(null)

  async function loadSchedules() {
    schedules.value = await api.schedule.list()
  }

  async function createSchedule(data: any) {
    const id = await api.schedule.create(data)
    await loadSchedules()
    return id
  }

  async function updateSchedule(id: number, data: any) {
    await api.schedule.update(id, data)
    await loadSchedules()
  }

  async function approveSchedule(id: number, approver: string, comment: string) {
    await api.schedule.approve(id, approver, comment)
    await loadSchedules()
  }

  async function confirmSchedule(id: number, operator: string) {
    await api.schedule.confirm(id, operator)
    await loadSchedules()
  }

  async function requestAdjust(id: number, operator: string, reason: string) {
    await api.schedule.requestAdjust(id, operator, reason)
    await loadSchedules()
  }

  const pendingApproval = computed(() =>
    schedules.value.filter(s => s.status === 'pending_approval' || s.status === 'adjust_requested')
  )

  const todaysSchedules = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return schedules.value.filter(s => s.scheduleDate === today)
  })

  return {
    schedules, selectedSchedule, loadSchedules, createSchedule, updateSchedule,
    approveSchedule, confirmSchedule, requestAdjust, pendingApproval, todaysSchedules
  }
})

export const useMonitoringStore = defineStore('monitoring', () => {
  const realtimeData = ref<Map<number, MonitoringData>>(new Map())
  const alerts = ref<Alert[]>([])
  const historyData = ref<MonitoringData[]>([])

  async function loadRealtime(pumpId: number) {
    const data = await api.monitoring.realtime(pumpId)
    if (data) {
      realtimeData.value.set(pumpId, data)
    }
    return data
  }

  async function loadHistory(pumpId: number, start: string, end: string) {
    historyData.value = await api.monitoring.history(pumpId, start, end)
    return historyData.value
  }

  async function insertData(data: any) {
    return await api.monitoring.insert(data)
  }

  async function loadAlerts() {
    alerts.value = await api.monitoring.alerts()
    return alerts.value
  }

  async function ackAlert(id: number, operator: string) {
    await api.monitoring.ackAlert(id, operator)
    await loadAlerts()
  }

  const unacknowledgedAlerts = computed(() =>
    alerts.value.filter(a => !a.acknowledged)
  )

  return { realtimeData, alerts, historyData, loadRealtime, loadHistory, insertData, loadAlerts, ackAlert, unacknowledgedAlerts }
})

export const useMaintenanceStore = defineStore('maintenance', () => {
  const orders = ref<MaintenanceOrder[]>([])

  async function loadOrders() {
    orders.value = await api.maintenance.list()
  }

  async function createOrder(data: any) {
    const id = await api.maintenance.create(data)
    await loadOrders()
    return id
  }

  async function updateOrder(id: number, data: any) {
    await api.maintenance.update(id, data)
    await loadOrders()
  }

  async function generateOrders() {
    const ids = await api.maintenance.generate()
    await loadOrders()
    return ids
  }

  const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
  const inProgressOrders = computed(() => orders.value.filter(o => o.status === 'in_progress'))

  return { orders, loadOrders, createOrder, updateOrder, generateOrders, pendingOrders, inProgressOrders }
})

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([])
  const records = ref<InventoryRecord[]>([])

  async function loadItems() {
    items.value = await api.inventory.list()
  }

  async function updateItem(id: number, data: any) {
    await api.inventory.update(id, data)
    await loadItems()
  }

  async function deductItem(partId: number, quantity: number, operator?: string, reason?: string, orderNo?: string) {
    const result = await api.inventory.deduct(partId, quantity, operator, reason, orderNo)
    await loadItems()
    await loadRecords()
    return result
  }

  async function inboundItem(partId: number, quantity: number, operator: string, reason: string) {
    const result = await api.inventory.inbound(partId, quantity, operator, reason)
    await loadItems()
    await loadRecords()
    return result
  }

  async function outboundItem(partId: number, quantity: number, operator: string, reason: string) {
    const result = await api.inventory.outbound(partId, quantity, operator, reason)
    await loadItems()
    await loadRecords()
    return result
  }

  async function loadRecords(partId?: number) {
    records.value = await api.inventory.records(partId)
    return records.value
  }

  async function loadLowStock() {
    return await api.inventory.lowStock()
  }

  const lowStockItems = computed(() => items.value.filter(i => i.quantity < i.safeStock))
  const criticalLowItems = computed(() => items.value.filter(i => i.quantity < i.minStock))

  return { items, records, loadItems, updateItem, deductItem, inboundItem, outboundItem, loadRecords, loadLowStock, lowStockItems, criticalLowItems }
})

export const useWeatherStore = defineStore('weather', () => {
  const forecast = ref<WeatherForecast[]>([])

  async function loadForecast() {
    forecast.value = await api.weather.forecast()
    return forecast.value
  }

  async function updateForecast(data: any[]) {
    await api.weather.update(data)
    await loadForecast()
  }

  const todayForecast = computed(() => forecast.value[0] || null)

  return { forecast, loadForecast, updateForecast, todayForecast }
})

export const useTopologyStore = defineStore('topology', () => {
  const nodes = ref<PipelineNode[]>([])

  async function loadNodes() {
    nodes.value = await api.pipelineNetwork.levels()
    return nodes.value
  }

  return { nodes, loadNodes }
})
