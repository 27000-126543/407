import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import Database from './database'

let mainWindow: BrowserWindow | null = null
let db: Database

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 768,
    title: '城市排水防涝与泵站智能调度系统',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  db = new Database()
  db.init()
  db.seed()
  createWindow()
  registerIpcHandlers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.close()
    app.quit()
  }
})

function registerIpcHandlers() {
  ipcMain.handle('pump:list', () => db.getPumps())
  ipcMain.handle('pump:get', (_e, id: number) => db.getPump(id))
  ipcMain.handle('pump:create', (_e, data: any) => db.createPump(data))
  ipcMain.handle('pump:update', (_e, id: number, data: any) => db.updatePump(id, data))
  ipcMain.handle('pump:delete', (_e, id: number) => db.deletePump(id))

  ipcMain.handle('schedule:list', () => db.getSchedules())
  ipcMain.handle('schedule:get', (_e, id: number) => db.getSchedule(id))
  ipcMain.handle('schedule:create', (_e, data: any) => db.createSchedule(data))
  ipcMain.handle('schedule:update', (_e, id: number, data: any) => db.updateSchedule(id, data))
  ipcMain.handle('schedule:approve', (_e, id: number, approver: string, comment: string) => db.approveSchedule(id, approver, comment))
  ipcMain.handle('schedule:confirm', (_e, id: number, operator: string) => db.confirmSchedule(id, operator))
  ipcMain.handle('schedule:requestAdjust', (_e, id: number, operator: string, reason: string) => db.requestScheduleAdjust(id, operator, reason))

  ipcMain.handle('monitoring:realtime', (_e, pumpId: number) => db.getRealtimeMonitoring(pumpId))
  ipcMain.handle('monitoring:history', (_e, pumpId: number, start: string, end: string) => db.getMonitoringHistory(pumpId, start, end))
  ipcMain.handle('monitoring:insert', (_e, data: any) => db.insertMonitoring(data))
  ipcMain.handle('monitoring:alerts', () => db.getActiveAlerts())
  ipcMain.handle('monitoring:alert:ack', (_e, id: number, operator: string) => db.acknowledgeAlert(id, operator))

  ipcMain.handle('maintenance:list', () => db.getMaintenanceOrders())
  ipcMain.handle('maintenance:create', (_e, data: any) => db.createMaintenanceOrder(data))
  ipcMain.handle('maintenance:update', (_e, id: number, data: any) => db.updateMaintenanceOrder(id, data))
  ipcMain.handle('maintenance:generate', () => db.generateMaintenanceOrders())

  ipcMain.handle('inventory:list', () => db.getInventory())
  ipcMain.handle('inventory:update', (_e, id: number, data: any) => db.updateInventory(id, data))
  ipcMain.handle('inventory:deduct', (_e, partId: number, quantity: number, operator?: string, reason?: string, orderNo?: string) => db.deductInventory(partId, quantity, operator, reason, orderNo))
  ipcMain.handle('inventory:inbound', (_e, partId: number, quantity: number, operator: string, reason: string) => db.inboundInventory(partId, quantity, operator, reason))
  ipcMain.handle('inventory:outbound', (_e, partId: number, quantity: number, operator: string, reason: string) => db.outboundInventory(partId, quantity, operator, reason))
  ipcMain.handle('inventory:records', (_e, partId?: number) => db.getInventoryRecords(partId))
  ipcMain.handle('inventory:lowStock', () => db.getLowStockItems())

  ipcMain.handle('statistics:summary', (_e, start: string, end: string) => db.getStatisticsSummary(start, end))
  ipcMain.handle('statistics:byPump', (_e, pumpId: number, start: string, end: string) => db.getPumpStatistics(pumpId, start, end))
  ipcMain.handle('statistics:byBasin', (_e, start: string, end: string) => db.getBasinStatistics(start, end))

  ipcMain.handle('weather:forecast', () => db.getWeatherForecast())
  ipcMain.handle('weather:update', (_e, data: any[]) => db.updateWeatherForecast(data))

  ipcMain.handle('pipelinenetwork:levels', () => db.getPipelineNetworkLevels())

  ipcMain.handle('dialog:save', async (_e, defaultName: string) => {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    })
    return result.filePath
  })
}
