"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const database_1 = __importDefault(require("./database"));
let mainWindow = null;
let db;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1280,
        minHeight: 768,
        title: '城市排水防涝与泵站智能调度系统',
        webPreferences: {
            preload: (0, path_1.join)(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile((0, path_1.join)(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    db = new database_1.default();
    db.init();
    db.seed();
    createWindow();
    registerIpcHandlers();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        db.close();
        electron_1.app.quit();
    }
});
function registerIpcHandlers() {
    electron_1.ipcMain.handle('pump:list', () => db.getPumps());
    electron_1.ipcMain.handle('pump:get', (_e, id) => db.getPump(id));
    electron_1.ipcMain.handle('pump:create', (_e, data) => db.createPump(data));
    electron_1.ipcMain.handle('pump:update', (_e, id, data) => db.updatePump(id, data));
    electron_1.ipcMain.handle('pump:delete', (_e, id) => db.deletePump(id));
    electron_1.ipcMain.handle('schedule:list', () => db.getSchedules());
    electron_1.ipcMain.handle('schedule:get', (_e, id) => db.getSchedule(id));
    electron_1.ipcMain.handle('schedule:create', (_e, data) => db.createSchedule(data));
    electron_1.ipcMain.handle('schedule:update', (_e, id, data) => db.updateSchedule(id, data));
    electron_1.ipcMain.handle('schedule:approve', (_e, id, approver, comment) => db.approveSchedule(id, approver, comment));
    electron_1.ipcMain.handle('schedule:reject', (_e, id, approver, reason) => db.rejectSchedule(id, approver, reason));
    electron_1.ipcMain.handle('schedule:confirm', (_e, id, operator) => db.confirmSchedule(id, operator));
    electron_1.ipcMain.handle('schedule:requestAdjust', (_e, id, operator, reason) => db.requestScheduleAdjust(id, operator, reason));
    electron_1.ipcMain.handle('monitoring:realtime', (_e, pumpId) => db.getRealtimeMonitoring(pumpId));
    electron_1.ipcMain.handle('monitoring:history', (_e, pumpId, start, end) => db.getMonitoringHistory(pumpId, start, end));
    electron_1.ipcMain.handle('monitoring:insert', (_e, data) => db.insertMonitoring(data));
    electron_1.ipcMain.handle('monitoring:alerts', () => db.getAlerts());
    electron_1.ipcMain.handle('monitoring:alert:insert', (_e, alert) => db.insertAlert(alert));
    electron_1.ipcMain.handle('monitoring:alert:ack', (_e, id, operator) => db.acknowledgeAlert(id, operator));
    electron_1.ipcMain.handle('monitoring:disposal:list', (_e, alertId) => db.getDisposalRecords(alertId));
    electron_1.ipcMain.handle('monitoring:disposal:add', (_e, data) => db.addDisposalRecord(data));
    electron_1.ipcMain.handle('monitoring:disposal:update', (_e, id, data) => db.updateDisposalRecord(id, data));
    electron_1.ipcMain.handle('maintenance:list', () => db.getMaintenanceOrders());
    electron_1.ipcMain.handle('maintenance:create', (_e, data) => db.createMaintenanceOrder(data));
    electron_1.ipcMain.handle('maintenance:update', (_e, id, data) => db.updateMaintenanceOrder(id, data));
    electron_1.ipcMain.handle('maintenance:generate', () => db.generateMaintenanceOrders());
    electron_1.ipcMain.handle('inventory:list', () => db.getInventory());
    electron_1.ipcMain.handle('inventory:update', (_e, id, data) => db.updateInventory(id, data));
    electron_1.ipcMain.handle('inventory:deduct', (_e, partId, quantity, operator, reason, orderNo) => db.deductInventory(partId, quantity, operator, reason, orderNo));
    electron_1.ipcMain.handle('inventory:inbound', (_e, partId, quantity, operator, reason) => db.inboundInventory(partId, quantity, operator, reason));
    electron_1.ipcMain.handle('inventory:outbound', (_e, partId, quantity, operator, reason) => db.outboundInventory(partId, quantity, operator, reason));
    electron_1.ipcMain.handle('inventory:records', (_e, partId) => db.getInventoryRecords(partId));
    electron_1.ipcMain.handle('inventory:lowStock', () => db.getLowStockItems());
    electron_1.ipcMain.handle('statistics:summary', (_e, start, end) => db.getStatisticsSummary(start, end));
    electron_1.ipcMain.handle('statistics:byPump', (_e, pumpId, start, end) => db.getPumpStatistics(pumpId, start, end));
    electron_1.ipcMain.handle('statistics:byBasin', (_e, start, end) => db.getBasinStatistics(start, end));
    electron_1.ipcMain.handle('weather:forecast', () => db.getWeatherForecast());
    electron_1.ipcMain.handle('weather:update', (_e, data) => db.updateWeatherForecast(data));
    electron_1.ipcMain.handle('pipelinenetwork:levels', () => db.getPipelineNetworkLevels());
    electron_1.ipcMain.handle('dialog:save', async (_e, defaultName) => {
        const result = await electron_1.dialog.showSaveDialog({
            defaultPath: defaultName,
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        });
        return result.filePath;
    });
}
