"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const electron_1 = require("electron");
const path_1 = require("path");
const dayjs_1 = __importDefault(require("dayjs"));
class PumpDatabase {
    constructor() {
        const dbPath = (0, path_1.join)(electron_1.app.getPath('userData'), 'pumping_station.db');
        this.db = new better_sqlite3_1.default(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
    }
    init() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS pumps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        location TEXT NOT NULL,
        longitude REAL DEFAULT 0,
        latitude REAL DEFAULT 0,
        basin TEXT,
        designFlow REAL NOT NULL,
        head REAL NOT NULL,
        power REAL NOT NULL,
        equipmentModel TEXT NOT NULL,
        manufacturer TEXT,
        installDate TEXT,
        ratedCurrent REAL NOT NULL,
        maxCurrent REAL NOT NULL,
        forebayWarningLevel REAL NOT NULL,
        forebayDangerLevel REAL NOT NULL,
        upstreamPumpIds TEXT DEFAULT '[]',
        downstreamPumpIds TEXT DEFAULT '[]',
        status TEXT DEFAULT 'standby',
        totalRuntime INTEGER DEFAULT 0,
        startCount INTEGER DEFAULT 0,
        lastMaintenanceDate TEXT,
        nextMaintenanceDate TEXT,
        createTime TEXT DEFAULT (datetime('now')),
        updateTime TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS pump_units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pumpId INTEGER NOT NULL,
        unitNumber TEXT NOT NULL,
        equipmentModel TEXT NOT NULL,
        ratedFlow REAL NOT NULL,
        ratedHead REAL NOT NULL,
        ratedPower REAL NOT NULL,
        ratedCurrent REAL NOT NULL,
        status TEXT DEFAULT 'standby',
        isBackup INTEGER DEFAULT 0,
        runtime INTEGER DEFAULT 0,
        startCount INTEGER DEFAULT 0,
        FOREIGN KEY (pumpId) REFERENCES pumps(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheduleDate TEXT NOT NULL,
        pumpId INTEGER NOT NULL,
        pumpName TEXT NOT NULL,
        planStartTime TEXT NOT NULL,
        planEndTime TEXT NOT NULL,
        plannedFlow REAL NOT NULL,
        operatingUnits TEXT DEFAULT '[]',
        reason TEXT,
        constraints TEXT,
        status TEXT DEFAULT 'draft',
        approver TEXT,
        approvalComment TEXT,
        approvalTime TEXT,
        operator TEXT,
        confirmTime TEXT,
        adjustReason TEXT,
        adjustRequestTime TEXT,
        createTime TEXT DEFAULT (datetime('now')),
        updateTime TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (pumpId) REFERENCES pumps(id)
      );

      CREATE TABLE IF NOT EXISTS monitoring_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pumpId INTEGER NOT NULL,
        unitId INTEGER,
        timestamp TEXT DEFAULT (datetime('now')),
        current REAL NOT NULL,
        voltage REAL DEFAULT 380,
        flow REAL NOT NULL,
        head REAL NOT NULL,
        forebayLevel REAL NOT NULL,
        outletPressure REAL DEFAULT 0,
        vibration REAL DEFAULT 0,
        temperature REAL DEFAULT 25,
        isAlert INTEGER DEFAULT 0,
        alertLevel TEXT,
        FOREIGN KEY (pumpId) REFERENCES pumps(id),
        FOREIGN KEY (unitId) REFERENCES pump_units(id)
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pumpId INTEGER NOT NULL,
        unitId INTEGER,
        alertType TEXT NOT NULL,
        alertLevel TEXT NOT NULL,
        parameter TEXT NOT NULL,
        actualValue REAL NOT NULL,
        threshold REAL NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT DEFAULT (datetime('now')),
        acknowledged INTEGER DEFAULT 0,
        acknowledgedBy TEXT,
        acknowledgedTime TEXT,
        autoAction TEXT,
        autoActionResult TEXT
      );

      CREATE TABLE IF NOT EXISTS maintenance_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderNo TEXT UNIQUE NOT NULL,
        pumpId INTEGER NOT NULL,
        unitId INTEGER,
        type TEXT NOT NULL,
        priority TEXT NOT NULL,
        description TEXT NOT NULL,
        triggerReason TEXT,
        triggerValue TEXT DEFAULT '{}',
        assignedTeam TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        partsRequired TEXT DEFAULT '[]',
        planDate TEXT NOT NULL,
        actualStartDate TEXT,
        actualEndDate TEXT,
        remark TEXT,
        createTime TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partNo TEXT UNIQUE NOT NULL,
        partName TEXT NOT NULL,
        specification TEXT,
        unit TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        safeStock INTEGER DEFAULT 10,
        minStock INTEGER DEFAULT 5,
        location TEXT,
        lastInboundTime TEXT,
        lastOutboundTime TEXT
      );

      CREATE TABLE IF NOT EXISTS inventory_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partId INTEGER NOT NULL,
        partNo TEXT NOT NULL,
        partName TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        beforeQuantity INTEGER NOT NULL,
        afterQuantity INTEGER NOT NULL,
        operator TEXT NOT NULL,
        reason TEXT,
        relatedOrderNo TEXT,
        createTime TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (partId) REFERENCES inventory(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS weather_forecast (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        forecastDate TEXT UNIQUE NOT NULL,
        temperature REAL DEFAULT 25,
        humidity REAL DEFAULT 60,
        rainfall REAL DEFAULT 0,
        rainfallIntensity TEXT DEFAULT 'light',
        rainfall24h REAL DEFAULT 0,
        windSpeed REAL DEFAULT 0,
        tideLevel REAL,
        updateTime TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS pipeline_nodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        longitude REAL NOT NULL,
        latitude REAL NOT NULL,
        connectedNodes TEXT DEFAULT '[]',
        currentLevel REAL DEFAULT 0,
        maxLevel REAL NOT NULL,
        warningLevel REAL NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_monitoring_pump_time ON monitoring_data(pumpId, timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(scheduleDate);
      CREATE INDEX IF NOT EXISTS idx_alerts_unacknowledged ON alerts(acknowledged);
    `);
    }
    seed() {
        const pumpCount = this.db.prepare('SELECT COUNT(*) as count FROM pumps').get();
        if (pumpCount.count > 0)
            return;
        const pumps = [
            {
                name: '城东一号泵站', code: 'CD-001', location: '城东新区滨河路88号',
                longitude: 114.3256, latitude: 30.5678, basin: '东湖流域',
                designFlow: 1200, head: 8.5, power: 500, equipmentModel: 'WQ1200-8.5-500',
                manufacturer: '上海水泵厂', installDate: '2020-06-15',
                ratedCurrent: 920, maxCurrent: 1100, forebayWarningLevel: 3.5, forebayDangerLevel: 4.2,
                upstreamPumpIds: [], downstreamPumpIds: [2, 3]
            },
            {
                name: '城南泵站', code: 'CD-002', location: '城南工业区排水大道',
                longitude: 114.3123, latitude: 30.5432, basin: '东湖流域',
                designFlow: 800, head: 7.2, power: 315, equipmentModel: 'WQ800-7.2-315',
                manufacturer: '上海水泵厂', installDate: '2019-03-20',
                ratedCurrent: 580, maxCurrent: 700, forebayWarningLevel: 3.0, forebayDangerLevel: 3.8,
                upstreamPumpIds: [1], downstreamPumpIds: [4]
            },
            {
                name: '城西泵站', code: 'CD-003', location: '城西开发区科技路',
                longitude: 114.2890, latitude: 30.5612, basin: '西湖流域',
                designFlow: 1000, head: 9.0, power: 450, equipmentModel: 'WQ1000-9-450',
                manufacturer: '长沙水泵厂', installDate: '2021-09-10',
                ratedCurrent: 830, maxCurrent: 1000, forebayWarningLevel: 3.2, forebayDangerLevel: 4.0,
                upstreamPumpIds: [1], downstreamPumpIds: [5]
            },
            {
                name: '城北泵站', code: 'CD-004', location: '城北物流园',
                longitude: 114.3001, latitude: 30.5987, basin: '东湖流域',
                designFlow: 600, head: 6.5, power: 220, equipmentModel: 'WQ600-6.5-220',
                manufacturer: '沈阳水泵厂', installDate: '2018-11-05',
                ratedCurrent: 410, maxCurrent: 500, forebayWarningLevel: 2.8, forebayDangerLevel: 3.5,
                upstreamPumpIds: [2], downstreamPumpIds: []
            },
            {
                name: '中心枢纽站', code: 'CD-005', location: '市中心人民广场地下',
                longitude: 114.3015, latitude: 30.5650, basin: '西湖流域',
                designFlow: 1500, head: 10.0, power: 630, equipmentModel: 'WQ1500-10-630',
                manufacturer: '上海水泵厂', installDate: '2022-01-18',
                ratedCurrent: 1150, maxCurrent: 1380, forebayWarningLevel: 4.0, forebayDangerLevel: 4.8,
                upstreamPumpIds: [3], downstreamPumpIds: []
            }
        ];
        const insertPump = this.db.prepare(`
      INSERT INTO pumps (name, code, location, longitude, latitude, basin, designFlow, head, power,
        equipmentModel, manufacturer, installDate, ratedCurrent, maxCurrent,
        forebayWarningLevel, forebayDangerLevel, upstreamPumpIds, downstreamPumpIds, status,
        lastMaintenanceDate, nextMaintenanceDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const insertUnit = this.db.prepare(`
      INSERT INTO pump_units (pumpId, unitNumber, equipmentModel, ratedFlow, ratedHead, ratedPower, ratedCurrent, status, isBackup)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        pumps.forEach((pump, idx) => {
            const result = insertPump.run(pump.name, pump.code, pump.location, pump.longitude, pump.latitude, pump.basin, pump.designFlow, pump.head, pump.power, pump.equipmentModel, pump.manufacturer, pump.installDate, pump.ratedCurrent, pump.maxCurrent, pump.forebayWarningLevel, pump.forebayDangerLevel, JSON.stringify(pump.upstreamPumpIds), JSON.stringify(pump.downstreamPumpIds), 'standby', (0, dayjs_1.default)().subtract(1, 'month').format('YYYY-MM-DD'), (0, dayjs_1.default)().add(2, 'month').format('YYYY-MM-DD'));
            const pumpId = result.lastInsertRowid;
            const unitCount = idx === 4 ? 4 : 3;
            for (let i = 1; i <= unitCount; i++) {
                insertUnit.run(pumpId, `${i}#`, pump.equipmentModel, pump.designFlow / (unitCount - (i === unitCount ? 1 : 0)), pump.head, pump.power / (unitCount - (i === unitCount ? 1 : 0)), pump.ratedCurrent / (unitCount - (i === unitCount ? 1 : 0)), i === unitCount ? 'standby' : (i === 1 ? 'running' : 'standby'), i === unitCount ? 1 : 0);
            }
        });
        const insertWeather = this.db.prepare(`
      INSERT INTO weather_forecast (forecastDate, temperature, humidity, rainfall, rainfallIntensity, rainfall24h, windSpeed, tideLevel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        for (let i = 0; i < 7; i++) {
            const date = (0, dayjs_1.default)().add(i, 'day').format('YYYY-MM-DD');
            const rainfall = i < 2 ? 45 + Math.random() * 20 : Math.random() * 10;
            insertWeather.run(date, 25 + Math.random() * 8, 60 + Math.random() * 30, rainfall, rainfall > 30 ? (rainfall > 50 ? 'storm' : 'heavy') : (rainfall > 10 ? 'moderate' : 'light'), rainfall * 1.2, 2 + Math.random() * 5, 1.5 + Math.sin(i * 0.5) * 0.8);
        }
        const pipelineNodes = [
            { code: 'N001', name: '城东泵站出口', type: 'pump', longitude: 114.3256, latitude: 30.5678, connected: [2, 3], maxLevel: 5.0, warningLevel: 3.5 },
            { code: 'N002', name: '城南干线节点1', type: 'manhole', longitude: 114.3200, latitude: 30.5550, connected: [1, 4], maxLevel: 4.5, warningLevel: 3.0 },
            { code: 'N003', name: '城西干线节点1', type: 'manhole', longitude: 114.3050, latitude: 30.5650, connected: [1, 5], maxLevel: 4.8, warningLevel: 3.2 },
            { code: 'N004', name: '城南泵站出口', type: 'pump', longitude: 114.3123, latitude: 30.5432, connected: [2, 6], maxLevel: 4.2, warningLevel: 2.8 },
            { code: 'N005', name: '城西泵站出口', type: 'pump', longitude: 114.2890, latitude: 30.5612, connected: [3, 7], maxLevel: 4.5, warningLevel: 3.0 },
            { code: 'N006', name: '城北泵站出口', type: 'pump', longitude: 114.3001, latitude: 30.5987, connected: [4, 8], maxLevel: 4.0, warningLevel: 2.7 },
            { code: 'N007', name: '中心泵站入口', type: 'manhole', longitude: 114.2950, latitude: 30.5630, connected: [5, 9], maxLevel: 5.0, warningLevel: 3.5 },
            { code: 'N008', name: '东北排水主干', type: 'manhole', longitude: 114.3100, latitude: 30.5800, connected: [6, 9], maxLevel: 4.8, warningLevel: 3.3 },
            { code: 'N009', name: '中心枢纽站出口', type: 'pump', longitude: 114.3015, latitude: 30.5650, connected: [7, 8, 10], maxLevel: 5.5, warningLevel: 3.8 },
            { code: 'N010', name: '长江排放口', type: 'outfall', longitude: 114.3300, latitude: 30.5500, connected: [9], maxLevel: 6.0, warningLevel: 4.0 }
        ];
        const insertNode = this.db.prepare(`
      INSERT INTO pipeline_nodes (code, name, type, longitude, latitude, connectedNodes, currentLevel, maxLevel, warningLevel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        pipelineNodes.forEach((node) => {
            insertNode.run(node.code, node.name, node.type, node.longitude, node.latitude, JSON.stringify(node.connected), 1.5 + Math.random() * 1.0, node.maxLevel, node.warningLevel);
        });
        const inventoryItems = [
            { partNo: 'SP-001', partName: '机械密封件', specification: 'WQ-500型', unit: '套', quantity: 25, safeStock: 20, minStock: 10, location: 'A-01-01' },
            { partNo: 'SP-002', partName: '轴承', specification: '6315-2RS', unit: '个', quantity: 18, safeStock: 15, minStock: 8, location: 'A-02-03' },
            { partNo: 'SP-003', partName: '叶轮', specification: 'WQ1200-8.5', unit: '个', quantity: 8, safeStock: 10, minStock: 5, location: 'B-01-02' },
            { partNo: 'SP-004', partName: '润滑油', specification: '46#抗磨液压油', unit: '桶', quantity: 12, safeStock: 10, minStock: 5, location: 'C-01-01' },
            { partNo: 'EL-001', partName: '电流传感器', specification: 'ACT-1000', unit: '个', quantity: 6, safeStock: 8, minStock: 4, location: 'D-01-01' },
            { partNo: 'EL-002', partName: '液位变送器', specification: 'LT-2000', unit: '台', quantity: 4, safeStock: 6, minStock: 3, location: 'D-02-01' },
            { partNo: 'EL-003', partName: 'PLC模块', specification: 'S7-300', unit: '块', quantity: 3, safeStock: 5, minStock: 2, location: 'D-03-01' }
        ];
        const insertInventory = this.db.prepare(`
      INSERT INTO inventory (partNo, partName, specification, unit, quantity, safeStock, minStock, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        inventoryItems.forEach(item => {
            insertInventory.run(item.partNo, item.partName, item.specification, item.unit, item.quantity, item.safeStock, item.minStock, item.location);
        });
        const now = (0, dayjs_1.default)();
        for (let i = 0; i < 288; i++) {
            const timestamp = now.subtract((288 - i) * 5, 'minute').format('YYYY-MM-DD HH:mm:ss');
            for (let p = 1; p <= 5; p++) {
                const pump = this.getPump(p);
                if (!pump)
                    continue;
                const isRunning = Math.random() > 0.3;
                this.db.prepare(`
          INSERT INTO monitoring_data (pumpId, timestamp, current, flow, head, forebayLevel, vibration, temperature, isAlert, alertLevel)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(p, timestamp, isRunning ? (pump.ratedCurrent * (0.7 + Math.random() * 0.35)) : (2 + Math.random() * 3), isRunning ? (pump.designFlow * 0.6 * (0.85 + Math.random() * 0.3)) : 0, pump.head * (0.9 + Math.random() * 0.2), 1.5 + Math.sin(i * 0.1) * 1.2 + Math.random() * 0.3, 1.5 + Math.random() * 2, 25 + Math.random() * 15, 0, null);
            }
        }
    }
    getPumps() {
        return this.db.prepare('SELECT * FROM pumps ORDER BY id').all().map((p) => ({
            ...p,
            upstreamPumpIds: JSON.parse(p.upstreamPumpIds || '[]'),
            downstreamPumpIds: JSON.parse(p.downstreamPumpIds || '[]')
        }));
    }
    getPump(id) {
        const pump = this.db.prepare('SELECT * FROM pumps WHERE id = ?').get(id);
        if (!pump)
            return null;
        return {
            ...pump,
            upstreamPumpIds: JSON.parse(pump.upstreamPumpIds || '[]'),
            downstreamPumpIds: JSON.parse(pump.downstreamPumpIds || '[]'),
            units: this.db.prepare('SELECT * FROM pump_units WHERE pumpId = ?').all(id)
        };
    }
    createPump(data) {
        const result = this.db.prepare(`
      INSERT INTO pumps (name, code, location, longitude, latitude, basin, designFlow, head, power,
        equipmentModel, manufacturer, installDate, ratedCurrent, maxCurrent,
        forebayWarningLevel, forebayDangerLevel, upstreamPumpIds, downstreamPumpIds, status,
        lastMaintenanceDate, nextMaintenanceDate, updateTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(data.name, data.code, data.location, data.longitude, data.latitude, data.basin, data.designFlow, data.head, data.power, data.equipmentModel, data.manufacturer, data.installDate, data.ratedCurrent, data.maxCurrent, data.forebayWarningLevel, data.forebayDangerLevel, JSON.stringify(data.upstreamPumpIds || []), JSON.stringify(data.downstreamPumpIds || []), data.status || 'standby', data.lastMaintenanceDate, data.nextMaintenanceDate);
        return result.lastInsertRowid;
    }
    updatePump(id, data) {
        this.db.prepare(`
      UPDATE pumps SET name = ?, code = ?, location = ?, longitude = ?, latitude = ?, basin = ?,
        designFlow = ?, head = ?, power = ?, equipmentModel = ?, manufacturer = ?, installDate = ?,
        ratedCurrent = ?, maxCurrent = ?, forebayWarningLevel = ?, forebayDangerLevel = ?,
        upstreamPumpIds = ?, downstreamPumpIds = ?, status = ?, updateTime = datetime('now')
      WHERE id = ?
    `).run(data.name, data.code, data.location, data.longitude, data.latitude, data.basin, data.designFlow, data.head, data.power, data.equipmentModel, data.manufacturer, data.installDate, data.ratedCurrent, data.maxCurrent, data.forebayWarningLevel, data.forebayDangerLevel, JSON.stringify(data.upstreamPumpIds || []), JSON.stringify(data.downstreamPumpIds || []), data.status, id);
    }
    deletePump(id) {
        this.db.prepare('DELETE FROM pumps WHERE id = ?').run(id);
    }
    getSchedules() {
        return this.db.prepare('SELECT * FROM schedules ORDER BY scheduleDate DESC, id DESC').all().map((s) => ({
            ...s,
            operatingUnits: JSON.parse(s.operatingUnits || '[]')
        }));
    }
    getSchedule(id) {
        const schedule = this.db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
        if (!schedule)
            return null;
        return {
            ...schedule,
            operatingUnits: JSON.parse(schedule.operatingUnits || '[]')
        };
    }
    createSchedule(data) {
        const result = this.db.prepare(`
      INSERT INTO schedules (scheduleDate, pumpId, pumpName, planStartTime, planEndTime,
        plannedFlow, operatingUnits, reason, constraints, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.scheduleDate, data.pumpId, data.pumpName, data.planStartTime, data.planEndTime, data.plannedFlow, JSON.stringify(data.operatingUnits || []), data.reason, data.constraints, data.status || 'pending_approval');
        return result.lastInsertRowid;
    }
    updateSchedule(id, data) {
        this.db.prepare(`
      UPDATE schedules SET scheduleDate = ?, pumpId = ?, pumpName = ?, planStartTime = ?,
        planEndTime = ?, plannedFlow = ?, operatingUnits = ?, reason = ?, constraints = ?,
        status = ?, updateTime = datetime('now')
      WHERE id = ?
    `).run(data.scheduleDate, data.pumpId, data.pumpName, data.planStartTime, data.planEndTime, data.plannedFlow, JSON.stringify(data.operatingUnits || []), data.reason, data.constraints, data.status, id);
    }
    approveSchedule(id, approver, comment) {
        this.db.prepare(`
      UPDATE schedules SET status = 'approved', approver = ?, approvalComment = ?,
        approvalTime = datetime('now'), updateTime = datetime('now')
      WHERE id = ?
    `).run(approver, comment, id);
    }
    confirmSchedule(id, operator) {
        this.db.prepare(`
      UPDATE schedules SET status = 'confirmed', operator = ?, confirmTime = datetime('now'),
        updateTime = datetime('now')
      WHERE id = ?
    `).run(operator, id);
    }
    requestScheduleAdjust(id, operator, reason) {
        this.db.prepare(`
      UPDATE schedules SET status = 'adjust_requested', operator = ?, adjustReason = ?,
        adjustRequestTime = datetime('now'), updateTime = datetime('now')
      WHERE id = ?
    `).run(operator, reason, id);
    }
    getRealtimeMonitoring(pumpId) {
        return this.db.prepare(`
      SELECT * FROM monitoring_data WHERE pumpId = ? ORDER BY timestamp DESC LIMIT 1
    `).get(pumpId);
    }
    getMonitoringHistory(pumpId, start, end) {
        return this.db.prepare(`
      SELECT * FROM monitoring_data
      WHERE pumpId = ? AND timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `).all(pumpId, start, end);
    }
    insertMonitoring(data) {
        let isAlert = 0;
        let alertLevel = null;
        const pump = this.getPump(data.pumpId);
        if (pump) {
            if (data.current > pump.maxCurrent) {
                isAlert = 1;
                alertLevel = 'danger';
                this.insertAlert({
                    pumpId: data.pumpId,
                    unitId: data.unitId,
                    alertType: '过流',
                    alertLevel: 'danger',
                    parameter: 'current',
                    actualValue: data.current,
                    threshold: pump.maxCurrent,
                    message: `泵组电流超过最大值: ${data.current.toFixed(1)}A > ${pump.maxCurrent}A`
                });
            }
            else if (data.current > pump.ratedCurrent) {
                isAlert = 1;
                alertLevel = 'warning';
            }
            if (data.forebayLevel > pump.forebayDangerLevel) {
                isAlert = 1;
                alertLevel = 'danger';
                this.insertAlert({
                    pumpId: data.pumpId,
                    unitId: data.unitId,
                    alertType: '前池水位过高',
                    alertLevel: 'critical',
                    parameter: 'forebayLevel',
                    actualValue: data.forebayLevel,
                    threshold: pump.forebayDangerLevel,
                    message: `前池水位超危险值: ${data.forebayLevel.toFixed(2)}m > ${pump.forebayDangerLevel}m，已自动启动备用泵`
                });
            }
            else if (data.forebayLevel > pump.forebayWarningLevel) {
                isAlert = 1;
                alertLevel = alertLevel || 'warning';
            }
        }
        const result = this.db.prepare(`
      INSERT INTO monitoring_data (pumpId, unitId, current, voltage, flow, head, forebayLevel,
        outletPressure, vibration, temperature, isAlert, alertLevel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.pumpId, data.unitId, data.current, data.voltage || 380, data.flow, data.head, data.forebayLevel, data.outletPressure || 0, data.vibration || 0, data.temperature || 25, isAlert, alertLevel);
        return result.lastInsertRowid;
    }
    insertAlert(data) {
        const result = this.db.prepare(`
      INSERT INTO alerts (pumpId, unitId, alertType, alertLevel, parameter, actualValue, threshold, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.pumpId, data.unitId, data.alertType, data.alertLevel, data.parameter, data.actualValue, data.threshold, data.message);
        return result.lastInsertRowid;
    }
    getActiveAlerts() {
        return this.db.prepare(`
      SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY timestamp DESC
    `).all();
    }
    acknowledgeAlert(id, operator) {
        this.db.prepare(`
      UPDATE alerts SET acknowledged = 1, acknowledgedBy = ?, acknowledgedTime = datetime('now')
      WHERE id = ?
    `).run(operator, id);
    }
    getMaintenanceOrders() {
        return this.db.prepare(`
      SELECT * FROM maintenance_orders ORDER BY createTime DESC
    `).all().map((o) => ({
            ...o,
            triggerValue: JSON.parse(o.triggerValue || '{}'),
            partsRequired: JSON.parse(o.partsRequired || '[]')
        }));
    }
    createMaintenanceOrder(data) {
        const orderNo = 'MO-' + (0, dayjs_1.default)().format('YYYYMMDD') + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        const result = this.db.prepare(`
      INSERT INTO maintenance_orders (orderNo, pumpId, unitId, type, priority, description,
        triggerReason, triggerValue, assignedTeam, partsRequired, planDate, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderNo, data.pumpId, data.unitId, data.type, data.priority, data.description, data.triggerReason, JSON.stringify(data.triggerValue || {}), data.assignedTeam, JSON.stringify(data.partsRequired || []), data.planDate, data.remark);
        return result.lastInsertRowid;
    }
    updateMaintenanceOrder(id, data) {
        this.db.prepare(`
      UPDATE maintenance_orders SET type = ?, priority = ?, description = ?, assignedTeam = ?,
        status = ?, partsRequired = ?, planDate = ?, actualStartDate = ?, actualEndDate = ?, remark = ?
      WHERE id = ?
    `).run(data.type, data.priority, data.description, data.assignedTeam, data.status, JSON.stringify(data.partsRequired || []), data.planDate, data.actualStartDate, data.actualEndDate, data.remark, id);
    }
    generateMaintenanceOrders() {
        const pumps = this.getPumps();
        const generatedIds = [];
        pumps.forEach(pump => {
            const runtimeThreshold = 2000;
            const startCountThreshold = 500;
            const needsMaintenance = pump.totalRuntime >= runtimeThreshold || pump.startCount >= startCountThreshold;
            if (needsMaintenance) {
                const triggerReason = [];
                const triggerValue = {};
                if (pump.totalRuntime >= runtimeThreshold) {
                    triggerReason.push(`运行时长达到阈值: ${pump.totalRuntime}h`);
                    triggerValue.runtime = pump.totalRuntime;
                }
                if (pump.startCount >= startCountThreshold) {
                    triggerReason.push(`启停次数达到阈值: ${pump.startCount}次`);
                    triggerValue.startCount = pump.startCount;
                }
                const id = this.createMaintenanceOrder({
                    pumpId: pump.id,
                    type: 'preventive',
                    priority: 'medium',
                    description: `泵站【${pump.name}】预防性维护`,
                    triggerReason: triggerReason.join('；'),
                    triggerValue,
                    assignedTeam: '维修一班',
                    partsRequired: [
                        { partId: 1, partName: '机械密封件', quantity: 1 },
                        { partId: 2, partName: '轴承', quantity: 2 }
                    ],
                    planDate: (0, dayjs_1.default)().add(3, 'day').format('YYYY-MM-DD'),
                    remark: '按规程进行全面检查维护'
                });
                generatedIds.push(id);
                this.db.prepare('UPDATE pumps SET totalRuntime = 0, startCount = 0, lastMaintenanceDate = date(\'now\'), nextMaintenanceDate = date(\'now\', \'+3 months\') WHERE id = ?').run(pump.id);
            }
        });
        return generatedIds;
    }
    getInventory() {
        return this.db.prepare('SELECT * FROM inventory ORDER BY id').all();
    }
    updateInventory(id, data) {
        this.db.prepare(`
      UPDATE inventory SET partName = ?, specification = ?, unit = ?, quantity = ?,
        safeStock = ?, minStock = ?, location = ?
      WHERE id = ?
    `).run(data.partName, data.specification, data.unit, data.quantity, data.safeStock, data.minStock, data.location, id);
    }
    deductInventory(partId, quantity, operator = '系统', reason = '维保工单扣减', orderNo) {
        const item = this.db.prepare('SELECT * FROM inventory WHERE id = ?').get(partId);
        if (!item || item.quantity < quantity)
            return false;
        const beforeQuantity = item.quantity;
        const afterQuantity = item.quantity - quantity;
        this.db.prepare(`
      UPDATE inventory SET quantity = quantity - ?, lastOutboundTime = datetime('now') WHERE id = ?
    `).run(quantity, partId);
        this.db.prepare(`
      INSERT INTO inventory_records (partId, partNo, partName, type, quantity, beforeQuantity, afterQuantity, operator, reason, relatedOrderNo)
      VALUES (?, ?, ?, 'outbound', ?, ?, ?, ?, ?, ?)
    `).run(partId, item.partNo, item.partName, quantity, beforeQuantity, afterQuantity, operator, reason, orderNo || null);
        return true;
    }
    inboundInventory(partId, quantity, operator, reason) {
        const item = this.db.prepare('SELECT * FROM inventory WHERE id = ?').get(partId);
        if (!item)
            return false;
        const beforeQuantity = item.quantity;
        const afterQuantity = item.quantity + quantity;
        this.db.prepare(`
      UPDATE inventory SET quantity = quantity + ?, lastInboundTime = datetime('now') WHERE id = ?
    `).run(quantity, partId);
        this.db.prepare(`
      INSERT INTO inventory_records (partId, partNo, partName, type, quantity, beforeQuantity, afterQuantity, operator, reason)
      VALUES (?, ?, ?, 'inbound', ?, ?, ?, ?, ?)
    `).run(partId, item.partNo, item.partName, quantity, beforeQuantity, afterQuantity, operator, reason);
        return true;
    }
    outboundInventory(partId, quantity, operator, reason) {
        return this.deductInventory(partId, quantity, operator, reason);
    }
    getInventoryRecords(partId) {
        if (partId) {
            return this.db.prepare(`
        SELECT * FROM inventory_records WHERE partId = ? ORDER BY createTime DESC LIMIT 100
      `).all(partId);
        }
        return this.db.prepare(`
      SELECT * FROM inventory_records ORDER BY createTime DESC LIMIT 200
    `).all();
    }
    getLowStockItems() {
        return this.db.prepare(`
      SELECT * FROM inventory WHERE quantity < safeStock ORDER BY quantity ASC
    `).all();
    }
    getStatisticsSummary(start, end) {
        const result = this.db.prepare(`
      SELECT
        COUNT(DISTINCT pumpId) as pumpCount,
        SUM(flow) * 5 / 60 as totalDischarge,
        AVG(flow) as avgFlow,
        COUNT(*) as dataPoints,
        SUM(CASE WHEN isAlert = 1 THEN 1 ELSE 0 END) as alertCount
      FROM monitoring_data
      WHERE timestamp BETWEEN ? AND ?
    `).get(start, end);
        const alertStats = this.db.prepare(`
      SELECT alertLevel, COUNT(*) as count FROM alerts
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY alertLevel
    `).all(start, end);
        return { ...(result || {}), alertBreakdown: alertStats };
    }
    getPumpStatistics(pumpId, start, end) {
        const pump = this.getPump(pumpId);
        if (!pump)
            return null;
        const data = this.db.prepare(`
      SELECT
        SUM(flow) * 5 / 60 as totalDischarge,
        AVG(flow) as avgFlow,
        MAX(flow) as maxFlow,
        AVG(current) as avgCurrent,
        AVG(head) as avgHead,
        SUM(CASE WHEN flow > 0 THEN 1 ELSE 0 END) * 5 / 60 as runtime,
        SUM(CASE WHEN isAlert = 1 THEN 1 ELSE 0 END) as alertCount,
        AVG(forebayLevel) as avgForebayLevel
      FROM monitoring_data
      WHERE pumpId = ? AND timestamp BETWEEN ? AND ?
    `).get(pumpId, start, end);
        const powerConsumption = data.runtime * pump.power;
        const unitEnergy = data.totalDischarge > 0 ? powerConsumption / data.totalDischarge * 1000 : 0;
        const faultCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM alerts
      WHERE pumpId = ? AND alertLevel IN ('danger', 'critical') AND timestamp BETWEEN ? AND ?
    `).get(pumpId, start, end).count;
        return {
            pumpId,
            pumpName: pump.name,
            basin: pump.basin,
            ...(data || {}),
            totalPowerConsumption: powerConsumption,
            unitEnergyConsumption: unitEnergy,
            equipmentAvailability: 100,
            faultCount
        };
    }
    getBasinStatistics(start, end) {
        const pumps = this.getPumps();
        const basins = [...new Set(pumps.map(p => p.basin))];
        return basins.map(basin => {
            const basinPumps = pumps.filter(p => p.basin === basin);
            let totalDischarge = 0;
            let totalRuntime = 0;
            let totalPower = 0;
            let totalFaults = 0;
            let totalAlerts = 0;
            basinPumps.forEach(pump => {
                const stats = this.getPumpStatistics(pump.id, start, end);
                if (stats) {
                    totalDischarge += stats.totalDischarge || 0;
                    totalRuntime += stats.runtime || 0;
                    totalPower += stats.totalPowerConsumption || 0;
                    totalFaults += stats.faultCount || 0;
                    totalAlerts += stats.alertCount || 0;
                }
            });
            return {
                basin,
                pumpCount: basinPumps.length,
                totalDischarge,
                totalRuntime,
                totalPowerConsumption: totalPower,
                unitEnergyConsumption: totalDischarge > 0 ? totalPower / totalDischarge * 1000 : 0,
                equipmentAvailability: 100,
                faultCount: totalFaults,
                alertCount: totalAlerts
            };
        });
    }
    getWeatherForecast() {
        return this.db.prepare('SELECT * FROM weather_forecast ORDER BY forecastDate').all();
    }
    updateWeatherForecast(data) {
        const stmt = this.db.prepare(`
      INSERT INTO weather_forecast (forecastDate, temperature, humidity, rainfall, rainfallIntensity, rainfall24h, windSpeed, tideLevel, updateTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(forecastDate) DO UPDATE SET
        temperature = excluded.temperature,
        humidity = excluded.humidity,
        rainfall = excluded.rainfall,
        rainfallIntensity = excluded.rainfallIntensity,
        rainfall24h = excluded.rainfall24h,
        windSpeed = excluded.windSpeed,
        tideLevel = excluded.tideLevel,
        updateTime = datetime('now')
    `);
        const tx = this.db.transaction((items) => {
            items.forEach(item => {
                stmt.run(item.forecastDate, item.temperature, item.humidity, item.rainfall, item.rainfallIntensity, item.rainfall24h, item.windSpeed, item.tideLevel);
            });
        });
        tx(data);
    }
    getPipelineNetworkLevels() {
        return this.db.prepare('SELECT * FROM pipeline_nodes ORDER BY id').all().map((n) => ({
            ...n,
            connectedNodes: JSON.parse(n.connectedNodes || '[]')
        }));
    }
    close() {
        this.db.close();
    }
}
exports.default = PumpDatabase;
