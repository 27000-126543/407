"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  pump: {
    list: () => electron.ipcRenderer.invoke("pump:list"),
    get: (id) => electron.ipcRenderer.invoke("pump:get", id),
    create: (data) => electron.ipcRenderer.invoke("pump:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("pump:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("pump:delete", id)
  },
  schedule: {
    list: () => electron.ipcRenderer.invoke("schedule:list"),
    get: (id) => electron.ipcRenderer.invoke("schedule:get", id),
    create: (data) => electron.ipcRenderer.invoke("schedule:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("schedule:update", id, data),
    approve: (id, approver, comment) => electron.ipcRenderer.invoke("schedule:approve", id, approver, comment),
    confirm: (id, operator) => electron.ipcRenderer.invoke("schedule:confirm", id, operator),
    requestAdjust: (id, operator, reason) => electron.ipcRenderer.invoke("schedule:requestAdjust", id, operator, reason)
  },
  monitoring: {
    realtime: (pumpId) => electron.ipcRenderer.invoke("monitoring:realtime", pumpId),
    history: (pumpId, start, end) => electron.ipcRenderer.invoke("monitoring:history", pumpId, start, end),
    insert: (data) => electron.ipcRenderer.invoke("monitoring:insert", data),
    alerts: () => electron.ipcRenderer.invoke("monitoring:alerts"),
    ackAlert: (id, operator) => electron.ipcRenderer.invoke("monitoring:alert:ack", id, operator)
  },
  maintenance: {
    list: () => electron.ipcRenderer.invoke("maintenance:list"),
    create: (data) => electron.ipcRenderer.invoke("maintenance:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("maintenance:update", id, data),
    generate: () => electron.ipcRenderer.invoke("maintenance:generate")
  },
  inventory: {
    list: () => electron.ipcRenderer.invoke("inventory:list"),
    update: (id, data) => electron.ipcRenderer.invoke("inventory:update", id, data),
    deduct: (partId, quantity, operator, reason, orderNo) => electron.ipcRenderer.invoke("inventory:deduct", partId, quantity, operator, reason, orderNo),
    inbound: (partId, quantity, operator, reason) => electron.ipcRenderer.invoke("inventory:inbound", partId, quantity, operator, reason),
    outbound: (partId, quantity, operator, reason) => electron.ipcRenderer.invoke("inventory:outbound", partId, quantity, operator, reason),
    records: (partId) => electron.ipcRenderer.invoke("inventory:records", partId),
    lowStock: () => electron.ipcRenderer.invoke("inventory:lowStock")
  },
  statistics: {
    summary: (start, end) => electron.ipcRenderer.invoke("statistics:summary", start, end),
    byPump: (pumpId, start, end) => electron.ipcRenderer.invoke("statistics:byPump", pumpId, start, end),
    byBasin: (start, end) => electron.ipcRenderer.invoke("statistics:byBasin", start, end)
  },
  weather: {
    forecast: () => electron.ipcRenderer.invoke("weather:forecast"),
    update: (data) => electron.ipcRenderer.invoke("weather:update", data)
  },
  pipelineNetwork: {
    levels: () => electron.ipcRenderer.invoke("pipelinenetwork:levels")
  },
  dialog: {
    save: (defaultName) => electron.ipcRenderer.invoke("dialog:save", defaultName)
  }
});
