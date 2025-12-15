import { useCallback } from "react"
import { toast } from "sonner"
import { useAdbDevices } from "@/hooks/queries/useAdbDevices"
import { useAdbApps } from "@/hooks/queries/useAdbApps"
import { useCreateReport } from "@/hooks/mutations/useReports"
import { useMonitoringStore } from "@/stores/use-monitoring-store"
import { useDeviceStore } from "@/stores/use-device-store"
import { generateReportName } from "@/lib/monitoring-utils"
import type { MetricKey } from "@/types/adb"
import type { StartMonitorPayload } from "@/hooks/queries/useAdbMetrics"

/**
 * Hook负责监控控制逻辑（开始/停止）
 */
export function useMonitoringControl(
  start: (payload: StartMonitorPayload) => void,
  stop: () => void
) {
  const { devices } = useAdbDevices()
  const { selectedDevice } = useDeviceStore()
  const { apps } = useAdbApps(selectedDevice?.id || null)
  const createReport = useCreateReport()

  const { selectedApp, selectedMetrics, chartData, startTime, setStartTime, setRunning } =
    useMonitoringStore()

  const handleStart = useCallback(() => {
    // 检查设备是否已选择且连接正常
    if (!selectedDevice) {
      toast.error("请先选择一个设备")
      return
    }

    // 检查设备状态是否为已连接
    if (selectedDevice.state !== "device") {
      toast.error("所选设备未连接，请检查设备状态")
      return
    }

    // 检查应用是否已选择
    if (!selectedApp || selectedApp.trim() === "") {
      toast.error("请选择要监控的应用")
      return
    }

    // 检查应用是否存在于当前设备上
    const appExists = apps.some(app => app.package === selectedApp)
    if (!appExists) {
      toast.error("所选应用在当前设备上不存在，请重新选择")
      return
    }

    // 检查是否选择了监控指标
    if (selectedMetrics.length === 0) {
      toast.error("请至少选择一个监控指标")
      return
    }

    const metricsToRequest = Array.from(
      new Set([
        ...selectedMetrics,
        ...(selectedMetrics.includes("power") ? (["battery", "battery_temp"] as MetricKey[]) : []),
      ])
    )

    setStartTime(Math.floor(Date.now() / 1000))
    setRunning(true)

    start({
      deviceId: selectedDevice.id,
      packageName: selectedApp,
      metrics: metricsToRequest,
      intervalMs: 1000,
    })
  }, [selectedDevice, selectedApp, selectedMetrics, start, setStartTime, setRunning, apps])

  const handleStop = useCallback(() => {
    stop()
    setRunning(false)

    if (startTime && selectedDevice && selectedApp && chartData.length > 0) {
      const endTime = Math.floor(Date.now() / 1000)
      const duration = endTime - startTime
      const device = devices.find(d => d.id === selectedDevice.id)
      const app = apps.find(a => a.package === selectedApp)

      const reportName = generateReportName(
        device?.model,
        selectedDevice.id,
        app?.label,
        selectedApp
      )

      createReport.mutate({
        name: reportName,
        device_id: selectedDevice.id,
        device_model: device?.model ?? null,
        app_package: selectedApp,
        app_label: app?.label ?? null,
        metrics: selectedMetrics,
        chart_data: chartData,
        start_time: startTime,
        end_time: endTime,
        duration,
      })
    }

    setStartTime(null)
  }, [
    stop,
    startTime,
    selectedDevice,
    selectedApp,
    chartData,
    devices,
    apps,
    createReport,
    selectedMetrics,
    setStartTime,
    setRunning,
  ])

  return {
    handleStart,
    handleStop,
  }
}
