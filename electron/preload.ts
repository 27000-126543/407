import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  pump: {
    list: () => ipcRenderer.invoke('pump:list'),
    get: (id: number) => ipcRenderer.invoke('pump:get', id),
    create: (data: any) => ipcRenderer.invoke('pump:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('pump:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('pump:delete', id)
  },
  schedule: {
    list: () => ipcRenderer.invoke('schedule:list'),
    get: (id: number) => ipcRenderer.invoke('schedule:get', id),
    create: (data: any) => ipcRenderer.invoke('schedule:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('schedule:update', id, data),
    approve: (id: number, approver: string, comment: string) => ipcRenderer.invoke('schedule:approve', id, approver, comment),
    confirm: (id: number, operator: string) => ipcRenderer.invoke('schedule:confirm', id, operator),
    requestAdjust: (id: number, operator: string, reason: string) => ipcRenderer.invoke('schedule:requestAdjust', id, operator, reason)
  },
  monitoring: {
    realtime: (pumpId: number) => ipcRenderer.invoke('monitoring:realtime', pumpId),
    history: (pumpId: number, start: string, end: string) => ipcRenderer.invoke('monitoring:history', pumpId, start, end),
    insert: (data: any) => ipcRenderer.invoke('monitoring:insert', data),
    alerts: () => ipcRenderer.invoke('monitoring:alerts'),
    ackAlert: (id: number, operator: string) => ipcRenderer.invoke('monitoring:alert:ack', id, operator)
  },
  maintenance: {
    list: () => ipcRenderer.invoke('maintenance:list'),
    create: (data: any) => ipcRenderer.invoke('maintenance:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('maintenance:update', id, data),
    generate: () => ipcRenderer.invoke('maintenance:generate')
  },
  inventory: {
    list: () => ipcRenderer.invoke('inventory:list'),
    update: (id: number, data: any) => ipcRenderer.invoke('inventory:update', id, data),
    deduct: (partId: number, quantity: number, operator?: string, reason?: string, orderNo?: string) => ipcRenderer.invoke('inventory:deduct', partId, quantity, operator, reason, orderNo),
    inbound: (partId: number, quantity: number, operator: string, reason: string) => ipcRenderer.invoke('inventory:inbound', partId, quantity, operator, reason),
    outbound: (partId: number, quantity: number, operator: string, reason: string) => ipcRenderer.invoke('inventory:outbound', partId, quantity, operator, reason),
    records: (partId?: number) => ipcRenderer.invoke('inventory:records', partId),
    lowStock: () => ipcRenderer.invoke('inventory:lowStock')
  },
  statistics: {
    summary: (start: string, end: string) => ipcRenderer.invoke('statistics:summary', start, end),
    byPump: (pumpId: number, start: string, end: string) => ipcRenderer.invoke('statistics:byPump', pumpId, start, end),
    byBasin: (start: string, end: string) => ipcRenderer.invoke('statistics:byBasin', start, end)
  },
  weather: {
    forecast: () => ipcRenderer.invoke('weather:forecast'),
    update: (data: any[]) => ipcRenderer.invoke('weather:update', data)
  },
  pipelineNetwork: {
    levels: () => ipcRenderer.invoke('pipelinenetwork:levels')
  },
  dialog: {
    save: (defaultName: string) => ipcRenderer.invoke('dialog:save', defaultName)
  }
})

declare global {
  interface Window {
    api: any
  }
}
