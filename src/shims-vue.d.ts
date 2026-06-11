declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  api: {
    pump: {
      list: () => Promise<any[]>
      get: (id: number) => Promise<any>
      create: (data: any) => Promise<number>
      update: (id: number, data: any) => Promise<void>
      delete: (id: number) => Promise<void>
    }
    schedule: {
      list: () => Promise<any[]>
      get: (id: number) => Promise<any>
      create: (data: any) => Promise<number>
      update: (id: number, data: any) => Promise<void>
      approve: (id: number, approver: string, comment: string) => Promise<void>
      confirm: (id: number, operator: string) => Promise<void>
      requestAdjust: (id: number, operator: string, reason: string) => Promise<void>
    }
    monitoring: {
      realtime: (pumpId: number) => Promise<any>
      history: (pumpId: number, start: string, end: string) => Promise<any[]>
      insert: (data: any) => Promise<number>
      alerts: () => Promise<any[]>
      ackAlert: (id: number, operator: string) => Promise<void>
    }
    maintenance: {
      list: () => Promise<any[]>
      create: (data: any) => Promise<number>
      update: (id: number, data: any) => Promise<void>
      generate: () => Promise<number[]>
    }
    inventory: {
      list: () => Promise<any[]>
      update: (id: number, data: any) => Promise<void>
      deduct: (partId: number, quantity: number, operator?: string, reason?: string, orderNo?: string) => Promise<boolean>
      inbound: (partId: number, quantity: number, operator: string, reason: string) => Promise<boolean>
      outbound: (partId: number, quantity: number, operator: string, reason: string) => Promise<boolean>
      records: (partId?: number) => Promise<any[]>
      lowStock: () => Promise<any[]>
    }
    statistics: {
      summary: (start: string, end: string) => Promise<any>
      byPump: (pumpId: number, start: string, end: string) => Promise<any>
      byBasin: (start: string, end: string) => Promise<any[]>
    }
    weather: {
      forecast: () => Promise<any[]>
      update: (data: any[]) => Promise<void>
    }
    pipelineNetwork: {
      levels: () => Promise<any[]>
    }
    dialog: {
      save: (defaultName: string) => Promise<string | undefined>
    }
  }
}
