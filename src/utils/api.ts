import dayjs from 'dayjs'

const hasElectronAPI = typeof window !== 'undefined' && typeof (window as any).api !== 'undefined'

function generateMockPumps(): any[] {
  return [
    {
      id: 1, name: '城东一号泵站', code: 'CD-001', location: '城东新区滨河路88号',
      longitude: 114.3256, latitude: 30.5678, basin: '东湖流域',
      designFlow: 1200, head: 8.5, power: 500, equipmentModel: 'WQ1200-8.5-500',
      manufacturer: '上海水泵厂', installDate: '2020-06-15',
      ratedCurrent: 920, maxCurrent: 1100, forebayWarningLevel: 3.5, forebayDangerLevel: 4.2,
      upstreamPumpIds: [], downstreamPumpIds: [2, 3], status: 'running',
      totalRuntime: 1560, startCount: 320,
      lastMaintenanceDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
      nextMaintenanceDate: dayjs().add(2, 'month').format('YYYY-MM-DD'),
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      units: [
        { id: 1, pumpId: 1, unitNumber: '1#', equipmentModel: 'WQ1200-8.5-500', ratedFlow: 600, ratedHead: 8.5, ratedPower: 250, ratedCurrent: 460, status: 'running', isBackup: false, runtime: 800, startCount: 160, current: 420, flow: 550, head: 8.3 },
        { id: 2, pumpId: 1, unitNumber: '2#', equipmentModel: 'WQ1200-8.5-500', ratedFlow: 600, ratedHead: 8.5, ratedPower: 250, ratedCurrent: 460, status: 'standby', isBackup: false, runtime: 760, startCount: 160, current: 5, flow: 0, head: 8.5 },
        { id: 3, pumpId: 1, unitNumber: '3#', equipmentModel: 'WQ1200-8.5-500', ratedFlow: 600, ratedHead: 8.5, ratedPower: 250, ratedCurrent: 460, status: 'standby', isBackup: true, runtime: 0, startCount: 0, current: 2, flow: 0, head: 8.5 }
      ]
    },
    {
      id: 2, name: '城南泵站', code: 'CD-002', location: '城南工业区排水大道',
      longitude: 114.3123, latitude: 30.5432, basin: '东湖流域',
      designFlow: 800, head: 7.2, power: 315, equipmentModel: 'WQ800-7.2-315',
      manufacturer: '上海水泵厂', installDate: '2019-03-20',
      ratedCurrent: 580, maxCurrent: 700, forebayWarningLevel: 3.0, forebayDangerLevel: 3.8,
      upstreamPumpIds: [1], downstreamPumpIds: [4], status: 'standby',
      totalRuntime: 980, startCount: 210,
      lastMaintenanceDate: dayjs().subtract(2, 'month').format('YYYY-MM-DD'),
      nextMaintenanceDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      units: []
    },
    {
      id: 3, name: '城西泵站', code: 'CD-003', location: '城西开发区科技路',
      longitude: 114.2890, latitude: 30.5612, basin: '西湖流域',
      designFlow: 1000, head: 9.0, power: 450, equipmentModel: 'WQ1000-9-450',
      manufacturer: '长沙水泵厂', installDate: '2021-09-10',
      ratedCurrent: 830, maxCurrent: 1000, forebayWarningLevel: 3.2, forebayDangerLevel: 4.0,
      upstreamPumpIds: [1], downstreamPumpIds: [5], status: 'running',
      totalRuntime: 1200, startCount: 280,
      lastMaintenanceDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
      nextMaintenanceDate: dayjs().add(2, 'month').format('YYYY-MM-DD'),
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      units: []
    },
    {
      id: 4, name: '城北泵站', code: 'CD-004', location: '城北物流园',
      longitude: 114.3001, latitude: 30.5987, basin: '东湖流域',
      designFlow: 600, head: 6.5, power: 220, equipmentModel: 'WQ600-6.5-220',
      manufacturer: '沈阳水泵厂', installDate: '2018-11-05',
      ratedCurrent: 410, maxCurrent: 500, forebayWarningLevel: 2.8, forebayDangerLevel: 3.5,
      upstreamPumpIds: [2], downstreamPumpIds: [], status: 'maintenance',
      totalRuntime: 2500, startCount: 600,
      lastMaintenanceDate: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
      nextMaintenanceDate: dayjs().format('YYYY-MM-DD'),
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      units: []
    },
    {
      id: 5, name: '中心枢纽站', code: 'CD-005', location: '市中心人民广场地下',
      longitude: 114.3015, latitude: 30.5650, basin: '西湖流域',
      designFlow: 1500, head: 10.0, power: 630, equipmentModel: 'WQ1500-10-630',
      manufacturer: '上海水泵厂', installDate: '2022-01-18',
      ratedCurrent: 1150, maxCurrent: 1380, forebayWarningLevel: 4.0, forebayDangerLevel: 4.8,
      upstreamPumpIds: [3], downstreamPumpIds: [], status: 'running',
      totalRuntime: 850, startCount: 180,
      lastMaintenanceDate: dayjs().subtract(2, 'week').format('YYYY-MM-DD'),
      nextMaintenanceDate: dayjs().add(3, 'month').format('YYYY-MM-DD'),
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      units: []
    }
  ]
}

function generateMockSchedules(): any[] {
  const today = dayjs().format('YYYY-MM-DD')
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')

  return [
    {
      id: 1, scheduleDate: today, pumpId: 1, pumpName: '城东一号泵站',
      planStartTime: '06:00', planEndTime: '14:00', plannedFlow: 800,
      operatingUnits: [1, 2], reason: '预计中雨，24小时降雨量35mm',
      constraints: '需与上游泵站错峰运行', status: 'pending_approval',
      createTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')
    },
    {
      id: 2, scheduleDate: today, pumpId: 3, pumpName: '城西泵站',
      planStartTime: '04:00', planEndTime: '12:00', plannedFlow: 650,
      operatingUnits: [4], reason: '预计大雨，24小时降雨量55mm',
      constraints: '潮汐顶托影响，低潮位优先运行', status: 'approved',
      approver: '张主管', approvalComment: '同意执行', approvalTime: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      createTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss')
    },
    {
      id: 3, scheduleDate: today, pumpId: 5, pumpName: '中心枢纽站',
      planStartTime: '02:00', planEndTime: '18:00', plannedFlow: 1200,
      operatingUnits: [8, 9], reason: '预计暴雨，24小时降雨量85mm',
      constraints: '需为下游预留调蓄空间', status: 'confirmed',
      approver: '张主管', approvalComment: '优先保障运行', approvalTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      operator: '李值班', confirmTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      createTime: dayjs().subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss')
    },
    {
      id: 4, scheduleDate: tomorrow, pumpId: 2, pumpName: '城南泵站',
      planStartTime: '05:00', planEndTime: '13:00', plannedFlow: 500,
      operatingUnits: [4], reason: '预计小雨转中雨',
      constraints: '无特殊约束', status: 'draft',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  ]
}

function generateMockMonitoring(pumpId: number): any {
  const baseData: any = {
    1: { current: 850, flow: 720, head: 8.2, forebayLevel: 2.8 },
    2: { current: 15, flow: 0, head: 7.2, forebayLevel: 2.1 },
    3: { current: 780, flow: 680, head: 8.8, forebayLevel: 3.0 },
    4: { current: 8, flow: 0, head: 6.5, forebayLevel: 2.5 },
    5: { current: 1050, flow: 1150, head: 9.8, forebayLevel: 3.8 }
  }
  return {
    id: Date.now(),
    pumpId,
    timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ...baseData[pumpId] || { current: 10, flow: 0, head: 8, forebayLevel: 2 },
    voltage: 380,
    outletPressure: 0.8,
    vibration: 2.5,
    temperature: 35,
    isAlert: false
  }
}

function generateMockAlerts(): any[] {
  return [
    {
      id: 1, pumpId: 5, alertType: '前池水位过高', alertLevel: 'warning',
      parameter: 'forebayLevel', actualValue: 3.8, threshold: 4.0,
      message: '中心枢纽站前池水位接近警戒值: 3.8m',
      timestamp: dayjs().subtract(15, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      acknowledged: false
    },
    {
      id: 2, pumpId: 1, alertType: '电流偏高', alertLevel: 'warning',
      parameter: 'current', actualValue: 880, threshold: 920,
      message: '城东一号泵站电流接近额定值: 880A',
      timestamp: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      acknowledged: true, acknowledgedBy: '李值班',
      acknowledgedTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')
    }
  ]
}

function generateMockWeather(): any[] {
  return Array.from({ length: 7 }, (_, i) => ({
    id: i + 1,
    forecastDate: dayjs().add(i, 'day').format('YYYY-MM-DD'),
    temperature: 25 + Math.random() * 8,
    humidity: 60 + Math.random() * 30,
    rainfall: i < 3 ? 30 + Math.random() * 40 : Math.random() * 15,
    rainfallIntensity: i < 2 ? 'heavy' : (i === 2 ? 'moderate' : 'light'),
    rainfall24h: i < 3 ? (30 + Math.random() * 40) * 1.2 : Math.random() * 15,
    windSpeed: 2 + Math.random() * 5,
    tideLevel: 1.5 + Math.sin(i * 0.5) * 0.8,
    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }))
}

function generateMockInventory(): any[] {
  return [
    { id: 1, partNo: 'SP-001', partName: '机械密封件', specification: 'WQ-500型', unit: '套', quantity: 25, safeStock: 20, minStock: 10, location: 'A-01-01' },
    { id: 2, partNo: 'SP-002', partName: '轴承', specification: '6315-2RS', unit: '个', quantity: 8, safeStock: 15, minStock: 8, location: 'A-02-03' },
    { id: 3, partNo: 'SP-003', partName: '叶轮', specification: 'WQ1200-8.5', unit: '个', quantity: 5, safeStock: 10, minStock: 5, location: 'B-01-02' },
    { id: 4, partNo: 'SP-004', partName: '润滑油', specification: '46#抗磨液压油', unit: '桶', quantity: 3, safeStock: 10, minStock: 5, location: 'C-01-01' },
    { id: 5, partNo: 'EL-001', partName: '电流传感器', specification: 'ACT-1000', unit: '个', quantity: 6, safeStock: 8, minStock: 4, location: 'D-01-01' },
    { id: 6, partNo: 'EL-002', partName: '液位变送器', specification: 'LT-2000', unit: '台', quantity: 2, safeStock: 6, minStock: 3, location: 'D-02-01' },
    { id: 7, partNo: 'EL-003', partName: 'PLC模块', specification: 'S7-300', unit: '块', quantity: 1, safeStock: 5, minStock: 2, location: 'D-03-01' }
  ]
}

function generateMockMaintenance(): any[] {
  return [
    {
      id: 1, orderNo: 'MO-20260611-0001', pumpId: 4, type: 'preventive', priority: 'high',
      description: '城北泵站预防性维护', triggerReason: '运行时长2500h超过阈值2000h；启停次数600次超过阈值500次',
      triggerValue: { runtime: 2500, startCount: 600 },
      assignedTeam: '维修一班', status: 'pending',
      partsRequired: [{ partId: 1, partName: '机械密封件', quantity: 1 }, { partId: 2, partName: '轴承', quantity: 2 }],
      planDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    {
      id: 2, orderNo: 'MO-20260610-0001', pumpId: 2, type: 'corrective', priority: 'medium',
      description: '城南泵站2#机组异响处理', triggerReason: '运行中异常振动报警',
      triggerValue: {},
      assignedTeam: '维修二班', status: 'in_progress',
      partsRequired: [{ partId: 2, partName: '轴承', quantity: 1 }],
      planDate: dayjs().format('YYYY-MM-DD'),
      actualStartDate: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      createTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
    }
  ]
}

function generateMockPipelineNodes(): any[] {
  return [
    { id: 1, code: 'N001', name: '城东泵站出口', type: 'pump', longitude: 114.3256, latitude: 30.5678, connectedNodes: [2, 3], currentLevel: 2.8, maxLevel: 5.0, warningLevel: 3.5 },
    { id: 2, code: 'N002', name: '城南干线节点1', type: 'manhole', longitude: 114.3200, latitude: 30.5550, connectedNodes: [1, 4], currentLevel: 2.2, maxLevel: 4.5, warningLevel: 3.0 },
    { id: 3, code: 'N003', name: '城西干线节点1', type: 'manhole', longitude: 114.3050, latitude: 30.5650, connectedNodes: [1, 5], currentLevel: 2.5, maxLevel: 4.8, warningLevel: 3.2 },
    { id: 4, code: 'N004', name: '城南泵站出口', type: 'pump', longitude: 114.3123, latitude: 30.5432, connectedNodes: [2, 6], currentLevel: 2.1, maxLevel: 4.2, warningLevel: 2.8 },
    { id: 5, code: 'N005', name: '城西泵站出口', type: 'pump', longitude: 114.2890, latitude: 30.5612, connectedNodes: [3, 7], currentLevel: 3.0, maxLevel: 4.5, warningLevel: 3.0 },
    { id: 6, code: 'N006', name: '城北泵站出口', type: 'pump', longitude: 114.3001, latitude: 30.5987, connectedNodes: [4, 8], currentLevel: 2.5, maxLevel: 4.0, warningLevel: 2.7 },
    { id: 7, code: 'N007', name: '中心泵站入口', type: 'manhole', longitude: 114.2950, latitude: 30.5630, connectedNodes: [5, 9], currentLevel: 3.2, maxLevel: 5.0, warningLevel: 3.5 },
    { id: 8, code: 'N008', name: '东北排水主干', type: 'manhole', longitude: 114.3100, latitude: 30.5800, connectedNodes: [6, 9], currentLevel: 2.8, maxLevel: 4.8, warningLevel: 3.3 },
    { id: 9, code: 'N009', name: '中心枢纽站出口', type: 'pump', longitude: 114.3015, latitude: 30.5650, connectedNodes: [7, 8, 10], currentLevel: 3.8, maxLevel: 5.5, warningLevel: 3.8 },
    { id: 10, code: 'N010', name: '长江排放口', type: 'outfall', longitude: 114.3300, latitude: 30.5500, connectedNodes: [9], currentLevel: 3.5, maxLevel: 6.0, warningLevel: 4.0 }
  ]
}

const mockPumps = generateMockPumps()
const mockSchedules = generateMockSchedules()
const mockAlerts = generateMockAlerts()
const mockWeather = generateMockWeather()
const mockInventory = generateMockInventory()
const mockMaintenance = generateMockMaintenance()
const mockPipelineNodes = generateMockPipelineNodes()

export const api = hasElectronAPI ? (window as any).api : {
  pump: {
    list: () => Promise.resolve(mockPumps),
    get: (id: number) => Promise.resolve(mockPumps.find(p => p.id === id) || null),
    create: (data: any) => {
      const newId = Math.max(...mockPumps.map(p => p.id)) + 1
      mockPumps.push({ ...data, id: newId, createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss') })
      return Promise.resolve(newId)
    },
    update: (id: number, data: any) => {
      const idx = mockPumps.findIndex(p => p.id === id)
      if (idx >= 0) mockPumps[idx] = { ...mockPumps[idx], ...data, updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss') }
      return Promise.resolve()
    },
    delete: (id: number) => {
      const idx = mockPumps.findIndex(p => p.id === id)
      if (idx >= 0) mockPumps.splice(idx, 1)
      return Promise.resolve()
    }
  },
  schedule: {
    list: () => Promise.resolve(mockSchedules),
    get: (id: number) => Promise.resolve(mockSchedules.find(s => s.id === id) || null),
    create: (data: any) => {
      const newId = Math.max(...mockSchedules.map(s => s.id)) + 1
      mockSchedules.unshift({ ...data, id: newId, createTime: dayjs().format('YYYY-MM-DD HH:mm:ss') })
      return Promise.resolve(newId)
    },
    update: (id: number, data: any) => {
      const idx = mockSchedules.findIndex(s => s.id === id)
      if (idx >= 0) mockSchedules[idx] = { ...mockSchedules[idx], ...data, updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss') }
      return Promise.resolve()
    },
    approve: (id: number, approver: string, comment: string) => {
      const idx = mockSchedules.findIndex(s => s.id === id)
      if (idx >= 0) {
        mockSchedules[idx].status = 'approved'
        mockSchedules[idx].approver = approver
        mockSchedules[idx].approvalComment = comment
        mockSchedules[idx].approvalTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      return Promise.resolve()
    },
    confirm: (id: number, operator: string) => {
      const idx = mockSchedules.findIndex(s => s.id === id)
      if (idx >= 0) {
        mockSchedules[idx].status = 'confirmed'
        mockSchedules[idx].operator = operator
        mockSchedules[idx].confirmTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      return Promise.resolve()
    },
    requestAdjust: (id: number, operator: string, reason: string) => {
      const idx = mockSchedules.findIndex(s => s.id === id)
      if (idx >= 0) {
        mockSchedules[idx].status = 'adjust_requested'
        mockSchedules[idx].operator = operator
        mockSchedules[idx].adjustReason = reason
        mockSchedules[idx].adjustRequestTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      return Promise.resolve()
    }
  },
  monitoring: {
    realtime: (pumpId: number) => Promise.resolve(generateMockMonitoring(pumpId)),
    history: () => Promise.resolve([]),
    insert: () => Promise.resolve(Date.now()),
    alerts: () => Promise.resolve(mockAlerts),
    ackAlert: (id: number, operator: string) => {
      const alert = mockAlerts.find(a => a.id === id)
      if (alert) {
        alert.acknowledged = true
        alert.acknowledgedBy = operator
        alert.acknowledgedTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      return Promise.resolve()
    }
  },
  maintenance: {
    list: () => Promise.resolve(mockMaintenance),
    create: (data: any) => {
      const newId = Math.max(...mockMaintenance.map(m => m.id)) + 1
      const orderNo = 'MO-' + dayjs().format('YYYYMMDD') + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0')
      mockMaintenance.unshift({ ...data, id: newId, orderNo, createTime: dayjs().format('YYYY-MM-DD HH:mm:ss') })
      return Promise.resolve(newId)
    },
    update: (id: number, data: any) => {
      const idx = mockMaintenance.findIndex(m => m.id === id)
      if (idx >= 0) mockMaintenance[idx] = { ...mockMaintenance[idx], ...data }
      return Promise.resolve()
    },
    generate: () => {
      const generatedIds: number[] = []
      mockPumps.forEach(pump => {
        if (pump.totalRuntime >= 2000 || pump.startCount >= 500) {
          const newId = Math.max(...mockMaintenance.map(m => m.id)) + 1
          mockMaintenance.unshift({
            id: newId,
            orderNo: 'MO-' + dayjs().format('YYYYMMDD') + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
            pumpId: pump.id,
            type: 'preventive',
            priority: 'medium',
            description: `泵站【${pump.name}】预防性维护`,
            triggerReason: '自动触发',
            triggerValue: {},
            assignedTeam: '维修一班',
            status: 'pending',
            partsRequired: [],
            planDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
            createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
          })
          generatedIds.push(newId)
        }
      })
      return Promise.resolve(generatedIds)
    }
  },
  inventory: {
    list: () => Promise.resolve(mockInventory),
    update: (id: number, data: any) => {
      const idx = mockInventory.findIndex(i => i.id === id)
      if (idx >= 0) mockInventory[idx] = { ...mockInventory[idx], ...data }
      return Promise.resolve()
    },
    deduct: (partId: number, quantity: number) => {
      const item = mockInventory.find(i => i.id === partId)
      if (!item || item.quantity < quantity) return Promise.resolve(false)
      item.quantity -= quantity
      return Promise.resolve(true)
    },
    inbound: (partId: number, quantity: number) => {
      const item = mockInventory.find(i => i.id === partId)
      if (!item) return Promise.resolve(false)
      item.quantity += quantity
      return Promise.resolve(true)
    },
    outbound: (partId: number, quantity: number) => {
      const item = mockInventory.find(i => i.id === partId)
      if (!item || item.quantity < quantity) return Promise.resolve(false)
      item.quantity -= quantity
      return Promise.resolve(true)
    },
    records: () => Promise.resolve([]),
    lowStock: () => Promise.resolve(mockInventory.filter(i => i.quantity < i.safeStock))
  },
  statistics: {
    summary: () => Promise.resolve({
      pumpCount: 5,
      totalDischarge: 1256800,
      avgFlow: 520,
      dataPoints: 1440,
      alertCount: 8,
      alertBreakdown: [{ alertLevel: 'warning', count: 6 }, { alertLevel: 'danger', count: 2 }]
    }),
    byPump: (pumpId: number) => {
      const pump = mockPumps.find(p => p.id === pumpId)
      return Promise.resolve({
        pumpId,
        pumpName: pump?.name || '',
        basin: pump?.basin || '',
        totalDischarge: Math.random() * 500000 + 100000,
        avgFlow: Math.random() * 500 + 300,
        maxFlow: Math.random() * 300 + 800,
        runtime: Math.random() * 500 + 200,
        avgForebayLevel: Math.random() * 2 + 2,
        totalPowerConsumption: Math.random() * 50000 + 20000,
        unitEnergyConsumption: Math.random() * 300 + 500,
        equipmentAvailability: Math.random() * 2 + 98,
        faultCount: Math.floor(Math.random() * 3),
        alertCount: Math.floor(Math.random() * 10)
      })
    },
    byBasin: () => Promise.resolve([
      {
        basin: '东湖流域',
        pumpCount: 3,
        totalDischarge: 856000,
        totalRuntime: 1250,
        totalPowerConsumption: 85600,
        unitEnergyConsumption: 684.2,
        equipmentAvailability: 99.1,
        faultCount: 2,
        alertCount: 5
      },
      {
        basin: '西湖流域',
        pumpCount: 2,
        totalDischarge: 658000,
        totalRuntime: 980,
        totalPowerConsumption: 72300,
        unitEnergyConsumption: 732.5,
        equipmentAvailability: 98.7,
        faultCount: 1,
        alertCount: 3
      }
    ])
  },
  weather: {
    forecast: () => Promise.resolve(mockWeather),
    update: () => Promise.resolve()
  },
  pipelineNetwork: {
    levels: () => Promise.resolve(mockPipelineNodes)
  },
  dialog: {
    save: (defaultName: string) => Promise.resolve(defaultName)
  }
}

export default api
