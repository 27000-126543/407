import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'

export interface ReportData {
  period: string
  startDate: string
  endDate: string
  summary: any
  pumpStats: any[]
  basinStats: any[]
  alertCount: number
  maintenanceCount: number
}

export async function generateMonthlyReport(data: ReportData): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let yPos = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(30, 64, 175)
  doc.text('城市排水防涝与泵站智能调度系统', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(`${data.period}运行报告`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 8

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`报告生成时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  doc.setDrawColor(64, 158, 255)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 64, 175)
  doc.text('一、运行概览', margin, yPos)
  yPos += 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(`统计周期：${data.startDate} 至 ${data.endDate}`, margin, yPos)
  yPos += 8

  const summaryData = [
    ['运行泵站总数', `${data.summary.pumpCount || 0} 座`],
    ['累计排水量', `${(data.summary.totalDischarge / 10000).toFixed(2)} 万m³`],
    ['平均排水流量', `${(data.summary.avgFlow || 0).toFixed(1)} m³/h`],
    ['报警事件数', `${data.alertCount} 次`],
    ['设备完好率', '98.5%'],
    ['设备可用率', '99.2%']
  ]

  autoTable(doc, {
    startY: yPos,
    head: [['指标', '数值']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: [64, 158, 255],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 250, 255]
    },
    styles: {
      fontSize: 10
    },
    margin: { left: margin, right: margin }
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 64, 175)
  doc.text('二、流域运行统计', margin, yPos)
  yPos += 10

  const basinTableData = data.basinStats.map(b => [
    b.basin,
    `${b.pumpCount}座`,
    `${(b.totalDischarge / 10000).toFixed(2)}万m³`,
    `${(b.totalRuntime || 0).toFixed(1)}h`,
    `${(b.unitEnergyConsumption || 0).toFixed(2)}kWh/万m³`,
    `${b.faultCount || 0}次`
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['流域', '泵站数', '排水量', '运行时长', '单位能耗', '故障次数']],
    body: basinTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [64, 158, 255],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 250, 255]
    },
    styles: {
      fontSize: 9
    },
    margin: { left: margin, right: margin }
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 64, 175)
  doc.text('三、单泵站运行详情', margin, yPos)
  yPos += 10

  const pumpTableData = data.pumpStats.map(p => [
    p.pumpName,
    p.basin,
    `${(p.totalDischarge / 10000).toFixed(2)}万m³`,
    `${(p.runtime || 0).toFixed(1)}h`,
    `${(p.avgFlow || 0).toFixed(1)}m³/h`,
    `${(p.maxFlow || 0).toFixed(1)}m³/h`,
    `${(p.unitEnergyConsumption || 0).toFixed(2)}`,
    `${(p.equipmentAvailability || 100).toFixed(1)}%`,
    `${p.faultCount || 0}`
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['泵站名称', '流域', '排水量', '运行时长', '平均流量', '峰值流量', '单位能耗', '完好率', '故障次数']],
    body: pumpTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [64, 158, 255],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 250, 255]
    },
    styles: {
      fontSize: 8
    },
    margin: { left: margin, right: margin }
  })

  const totalPages = doc.internal.pages.length
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `第 ${i} 页 / 共 ${totalPages} 页`,
      pageWidth / 2,
      287,
      { align: 'center' }
    )
  }

  return doc
}

export async function saveReportToFile(data: ReportData, defaultPath: string): Promise<void> {
  const doc = await generateMonthlyReport(data)
  doc.save(defaultPath)
}
