import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useReports } from "@/hooks/queries/useReports"
import { useDeleteReport } from "@/hooks/mutations/useReports"
import { ReportDetailPage } from "@/pages/report-detail-page"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function ReportPage() {
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
  const { data: reports, isLoading } = useReports()
  const deleteReport = useDeleteReport()

  const handleRowClick = (reportId: number) => {
    setSelectedReportId(reportId)
    setViewMode("detail")
  }

  const handleBack = () => {
    setViewMode("list")
    setSelectedReportId(null)
  }

  const handleDelete = (e: React.MouseEvent, reportId: number) => {
    e.stopPropagation()
    deleteReport.mutate(reportId)
    toast.success("报告已删除")
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}时${minutes}分`
    }
    if (minutes > 0) {
      return `${minutes}分${secs}秒`
    }
    return `${secs}秒`
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (viewMode === "detail" && selectedReportId !== null) {
    return <ReportDetailPage reportId={selectedReportId} onBack={handleBack} />
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">性能报告</h2>
          <span className="text-sm text-muted-foreground">{reports?.length || 0} 个报告</span>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground py-4">加载中...</div>
        ) : !reports || reports.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            暂无报告，停止监控后会自动保存
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">报告名称</TableHead>
                <TableHead className="w-[120px]">设备</TableHead>
                <TableHead className="w-[120px]">应用</TableHead>
                <TableHead className="w-[100px] text-right">时长</TableHead>
                <TableHead className="w-[140px]">创建时间</TableHead>
                <TableHead className="w-[80px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map(report => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleRowClick(report.id)}
                >
                  <TableCell className="font-medium text-sm">{report.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {report.device_model || report.device_id}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {report.app_label || report.app_package}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatDuration(report.duration)}
                  </TableCell>
                  <TableCell className="text-sm">{formatTime(report.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={e => handleDelete(e, report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </ScrollArea>
  )
}
