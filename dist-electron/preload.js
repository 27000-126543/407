"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    pump: {
        list: () => electron_1.ipcRenderer.invoke('pump:list'),
        get: (id) => electron_1.ipcRenderer.invoke('pump:get', id),
        create: (data) => electron_1.ipcRenderer.invoke('pump:create', data),
        update: (id, data) => electron_1.ipcRenderer.invoke('pump:update', id, data),
        delete: (id) => electron_1.ipcRenderer.invoke('pump:delete', id)
    },
    schedule: {
        list: () => electron_1.ipcRenderer.invoke('schedule:list'),
        get: (id) => electron_1.ipcRenderer.invoke('schedule:get', id),
        create: (data) => electron_1.ipcRenderer.invoke('schedule:create', data),
        update: (id, data) => electron_1.ipcRenderer.invoke('schedule:update', id, data),
        approve: (id, approver, comment) => electron_1.ipcRenderer.invoke('schedule:approve', id, approver, comment),
        reject: (id, approver, reason) => electron_1.ipcRenderer.invoke('schedule:reject', id, approver, reason),
        confirm: (id, operator) => electron_1.ipcRenderer.invoke('schedule:confirm', id, operator),
        requestAdjust: (id, operator, reason) => electron_1.ipcRenderer.invoke('schedule:requestAdjust', id, operator, reason)
    },
    monitoring: {
        realtime: (pumpId) => electron_1.ipcRenderer.invoke('monitoring:realtime', pumpId),
        history: (pumpId, start, end) => electron_1.ipcRenderer.invoke('monitoring:history', pumpId, start, end),
        insert: (data) => electron_1.ipcRenderer.invoke('monitoring:insert', data),
        alerts: () => electron_1.ipcRenderer.invoke('monitoring:alerts'),
        insertAlert: (alert) => electron_1.ipcRenderer.invoke('monitoring:alert:insert', alert),
        ackAlert: (id, operator) => electron_1.ipcRenderer.invoke('monitoring:alert:ack', id, operator),
        disposalRecords: (alertId) => electron_1.ipcRenderer.invoke('monitoring:disposal:list', alertId),
        addDisposalRecord: (data) => electron_1.ipcRenderer.invoke('monitoring:disposal:add', data),
        updateDisposalRecord: (id, data) => electron_1.ipcRenderer.invoke('monitoring:disposal:update', id, data)
    },
    maintenance: {
        list: () => electron_1.ipcRenderer.invoke('maintenance:list'),
        create: (data) => electron_1.ipcRenderer.invoke('maintenance:create', data),
        update: (id, data) => electron_1.ipcRenderer.invoke('maintenance:update', id, data),
        generate: () => electron_1.ipcRenderer.invoke('maintenance:generate')
    },
    inventory: {
        list: () => electron_1.ipcRenderer.invoke('inventory:list'),
        update: (id, data) => electron_1.ipcRenderer.invoke('inventory:update', id, data),
        deduct: (partId, quantity, operator, reason, orderNo) => electron_1.ipcRenderer.invoke('inventory:deduct', partId, quantity, operator, reason, orderNo),
        inbound: (partId, quantity, operator, reason) => electron_1.ipcRenderer.invoke('inventory:inbound', partId, quantity, operator, reason),
        outbound: (partId, quantity, operator, reason) => electron_1.ipcRenderer.invoke('inventory:outbound', partId, quantity, operator, reason),
        records: (partId) => electron_1.ipcRenderer.invoke('inventory:records', partId),
        lowStock: () => electron_1.ipcRenderer.invoke('inventory:lowStock')
    },
    statistics: {
        summary: (start, end) => electron_1.ipcRenderer.invoke('statistics:summary', start, end),
        byPump: (pumpId, start, end) => electron_1.ipcRenderer.invoke('statistics:byPump', pumpId, start, end),
        byBasin: (start, end) => electron_1.ipcRenderer.invoke('statistics:byBasin', start, end)
    },
    weather: {
        forecast: () => electron_1.ipcRenderer.invoke('weather:forecast'),
        update: (data) => electron_1.ipcRenderer.invoke('weather:update', data)
    },
    pipelineNetwork: {
        levels: () => electron_1.ipcRenderer.invoke('pipelinenetwork:levels')
    },
    dialog: {
        save: (defaultName) => electron_1.ipcRenderer.invoke('dialog:save', defaultName)
    }
});
