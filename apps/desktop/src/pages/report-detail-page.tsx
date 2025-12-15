import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ReportBreadcrumb } from "@/components/breadcrumb/ReportBreadcrumb"
import { ReportDashboard } from "@/components/dashboard/ReportDashboard"
import { ChartList, ChartItem } from "@/components/charts/ChartList"
import { useReport } from "@/hooks/queries/useReports"
import { Cpu, Gauge, Zap, Database, ArrowUpDown, Download, FileText } from "lucide-react"
import { exportToCSV, exportToPDF } from "@/lib/export-utils"
import { useRef, useState } from "react"
import { toast } from "sonner"
import type { MetricKey } from "@/types/adb"

interface ReportDetailPageProps {
  reportId: number
  onBack: () => void
}

export function ReportDetailPage({ reportId, onBack }: ReportDetailPageProps) {
  const { data: report, isLoading, error } = useReport(reportId)
  const pdfRef = useRef<HTMLDivElement>(null)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [exportingCSV, setExportingCSV] = useState(false)

  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      </ScrollArea>
    )
  }

  if (error || !report) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="text-sm text-destructive">
            {error instanceof Error ? error.message : "加载失败"}
          </div>
        </div>
      </ScrollArea>
    )
  }

  const metrics: MetricKey[] = JSON.parse(report.metrics)
  const chartData = JSON.parse(report.chart_data)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}时${minutes}分${secs}秒`
    }
    if (minutes > 0) {
      return `${minutes}分${secs}秒`
    }
    return `${secs}秒`
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const handleExportCSV = async () => {
    if (!report) return
    if (chartData.length === 0) {
      toast.error("没有数据可导出")
      return
    }
    try {
      setExportingCSV(true)
      await exportToCSV(chartData, report.name)
      toast.success("CSV导出成功")
    } catch (error) {
      console.error("导出CSV失败:", error)
      toast.error(`导出CSV失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setExportingCSV(false)
    }
  }

  const handleExportPDF = async () => {
    if (!report || !pdfRef.current) return
    if (chartData.length === 0) {
      toast.error("没有数据可导出")
      return
    }
    try {
      setExportingPDF(true)
      await exportToPDF(pdfRef.current, report.name)
      toast.success("PDF导出成功")
    } catch (error) {
      console.error("导出PDF失败:", error)
      toast.error(`导出PDF失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setExportingPDF(false)
    }
  }

  return (
    <ScrollArea className="h-full">
      <div ref={pdfRef} data-pdf-export className="p-4 space-y-3">
        {/* 面包屑和基本信息 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <ReportBreadcrumb onBack={onBack} />
            <div className="flex items-center gap-2 no-print">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2"
                disabled={exportingCSV || chartData.length === 0}
              >
                <Download className="h-4 w-4" />
                {exportingCSV ? "导出中..." : "导出CSV"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
                disabled={exportingPDF || chartData.length === 0}
              >
                <FileText className="h-4 w-4" />
                {exportingPDF ? "导出中..." : "导出PDF"}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="font-medium">{report.name}</span>
            <Badge variant="outline" className="text-xs">
              {report.device_model || report.device_id}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {report.app_label || report.app_package}
            </Badge>
            <span className="text-muted-foreground">时长: {formatDuration(report.duration)}</span>
            <span className="text-muted-foreground">
              {formatTime(report.start_time)} - {formatTime(report.end_time)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Dashboard统计 */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">统计摘要</h3>
          <ReportDashboard chartData={chartData} metrics={metrics} />
        </div>

        <Separator />

        {/* Charts */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">性能图表</h3>
          <ChartList initialBrush={{ start: 0, end: 100 }}>
            {metrics.includes("cpu") && (
              <ChartItem
                key="cpu"
                title="CPU (%)"
                icon={<Cpu size={14} strokeWidth={1.8} />}
                data={chartData}
                xKey="time"
                yDomain={[0, 100]}
                height={224}
                lines={[{ dataKey: "cpu", label: "CPU", color: "hsl(217, 91%, 60%)" }]}
              />
            )}
            {metrics.includes("fps") && (
              <ChartItem
                key="fps"
                title="FPS"
                icon={<Gauge size={14} strokeWidth={1.8} />}
                data={chartData}
                xKey="time"
                yDomain={[0, 120]}
                height={224}
                lines={[{ dataKey: "fps", label: "FPS", color: "hsl(291, 64%, 42%)" }]}
              />
            )}
            {metrics.includes("power") && (
              <ChartItem
                key="power"
                title="耗能 / 电池"
                icon={<Zap size={14} strokeWidth={1.8} />}
                data={chartData}
                xKey="time"
                height={224}
                lines={[
                  { dataKey: "power", label: "功耗 (mA)", color: "hsl(16, 90%, 55%)" },
                  { dataKey: "battery", label: "电量 (%)", color: "hsl(45, 90%, 55%)" },
                  { dataKey: "battery_temp", label: "温度 (°C)", color: "hsl(10, 80%, 55%)" },
                ]}
              />
            )}
            {metrics.includes("memory") && (
              <ChartItem
                key="memory"
                title="内存 (MB)"
                icon={<Database size={14} strokeWidth={1.8} />}
                data={chartData}
                xKey="time"
                height={224}
                lines={[{ dataKey: "memory", label: "内存", color: "hsl(200, 80%, 45%)" }]}
              />
            )}
            {metrics.includes("traffic") && (
              <ChartItem
                key="traffic"
                title="流量 (KB/s)"
                icon={<ArrowUpDown size={14} strokeWidth={1.8} />}
                data={chartData}
                xKey="time"
                height={224}
                lines={[
                  { dataKey: "traffic_rx", label: "下行", color: "hsl(120, 70%, 40%)" },
                  { dataKey: "traffic_tx", label: "上行", color: "hsl(200, 70%, 50%)" },
                ]}
              />
            )}
          </ChartList>
        </div>
      </div>
    </ScrollArea>
  )
}
