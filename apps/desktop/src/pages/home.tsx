import { HeaderBar } from "@/components/header"
import { useAdbApps } from "@/hooks/useAdbApps"
import { useAdbDevices } from "@/hooks/useAdbDevices"
import { useAdbMetrics } from "@/hooks/useAdbMetrics"
import type { MetricKey } from "@/types/adb"
import { ChartList, ChartItem } from "@/components/charts/ChartList"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAppStore } from "@/stores/use-app-store"
import { ScrollArea } from "@/components/ui/scroll-area"

export function HomePage() {
  const [selectedDevice, setSelectedDevice] = useState("")
  const [selectedApp, setSelectedApp] = useState("")
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(["cpu", "memory"])
  const { setSelectedDevice: setSelectedDeviceInStore } = useAppStore()

  const {
    devices,
    search: deviceSearch,
    setSearch: setDeviceSearch,
    loading: loadingDevices,
    refresh: refreshDevices,
  } = useAdbDevices()

  const {
    apps,
    search: appSearch,
    setSearch: setAppSearch,
    loading: loadingApps,
    error: appError,
    refresh: refreshApps,
  } = useAdbApps(selectedDevice || null)

  const { data: metrics, running, start, stop } = useAdbMetrics()

  useEffect(() => {
    setSelectedApp("")
    setAppSearch("")
    if (selectedDevice) {
      refreshApps()
    }
  }, [selectedDevice, setAppSearch, refreshApps])

  const handleStart = () => {
    if (!selectedDevice || !selectedApp || selectedMetrics.length === 0) return
    start({
      deviceId: selectedDevice,
      packageName: selectedApp,
      metrics: selectedMetrics,
      intervalMs: 1000,
    })
  }

  // 模拟实时数据：每秒追加一条随机 CPU 数据，最多保留 120s
  const [history, setHistory] = useState<Record<string, number>[]>([])
  const startTimeRef = useRef<number | null>(null)
  const lastValuesRef = useRef<{
    fps?: number
    cpu?: number
    power?: number
    memory?: number
    network?: number
  }>({})

  // 监控开始时重置时间与历史
  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now()
      setHistory([])
      lastValuesRef.current = {}
    }
  }, [running])

  // 收集实时指标历史
  useEffect(() => {
    if (!metrics || !running) return

    // 初始化时间基准
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }

    const now = Date.now()
    const second = Math.floor((now - startTimeRef.current) / 1000)

    // 更新最新值（有值才覆盖）
    if (metrics.fps !== null && metrics.fps !== undefined) lastValuesRef.current.fps = metrics.fps
    if (metrics.cpu !== null && metrics.cpu !== undefined) lastValuesRef.current.cpu = metrics.cpu
    if (metrics.power !== null && metrics.power !== undefined) lastValuesRef.current.power = metrics.power
    if (metrics.memory_mb !== null && metrics.memory_mb !== undefined) lastValuesRef.current.memory = metrics.memory_mb
    if (metrics.network_kbps !== null && metrics.network_kbps !== undefined)
      lastValuesRef.current.network = metrics.network_kbps

    const { fps, cpu, power, memory, network } = lastValuesRef.current

    // 仅当至少有一个有效值时记录
    if ([fps, cpu, power, memory, network].some((v) => v !== undefined)) {
      setHistory((prev) =>
        [
          ...prev,
          {
            second,
            fps: fps ?? 0,
            cpu: cpu ?? 0,
            power: power ?? 0,
            memory: memory ?? 0,
            network: network ?? 0,
          },
        ].slice(-600)
      )
    }
  }, [metrics])

  const chartData = useMemo(() => history, [history])

  // 同步所选设备信息到全局，以便标题栏展示
  useEffect(() => {
    const device = devices.find((item) => item.id === selectedDevice) ?? null
    setSelectedDeviceInStore(device)
  }, [devices, selectedDevice, setSelectedDeviceInStore])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <HeaderBar
        deviceId={selectedDevice}
        devices={devices}
        deviceSearch={deviceSearch}
        loadingDevices={loadingDevices}
        onDeviceChange={(value) => {
          setSelectedDevice(value)
          refreshDevices()
        }}
        onDeviceSearch={setDeviceSearch}
        onRefreshDevices={refreshDevices}
        appId={selectedApp}
        apps={apps}
        appSearch={appSearch}
        loadingApps={loadingApps}
        appError={appError}
        onRefreshApps={refreshApps}
        onAppChange={setSelectedApp}
        onAppSearch={setAppSearch}
        metrics={selectedMetrics}
        onMetricsChange={setSelectedMetrics}
        running={running}
        onStart={handleStart}
        onStop={stop}
      />

      <main className="flex-1 overflow-hidden min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            <ChartList initialBrush={{ start: 0, end: 100 }}>
              {selectedMetrics.includes("cpu") && (
                <ChartItem
                  key="cpu"
                  title="CPU (%)"
                  data={chartData}
                  xKey="second"
                  yDomain={[0, 100]}
                  height={224}
                  lines={[{ dataKey: "cpu", label: "CPU", color: "hsl(217, 91%, 60%)" }]}
                />
              )}
              {selectedMetrics.includes("fps") && (
                <ChartItem
                  key="fps"
                  title="FPS"
                  data={chartData}
                  xKey="second"
                  yDomain={[0, 120]}
                  height={224}
                  lines={[{ dataKey: "fps", label: "FPS", color: "hsl(291, 64%, 42%)" }]}
                />
              )}
              {selectedMetrics.includes("power") && (
                <ChartItem
                  key="power"
                  title="耗能 (mA)"
                  data={chartData}
                  xKey="second"
                  height={224}
                  lines={[{ dataKey: "power", label: "功耗", color: "hsl(16, 90%, 55%)" }]}
                />
              )}
              {selectedMetrics.includes("memory") && (
                <ChartItem
                  key="memory"
                  title="内存 (MB)"
                  data={chartData}
                  xKey="second"
                  height={224}
                  lines={[{ dataKey: "memory", label: "内存", color: "hsl(200, 80%, 45%)" }]}
                />
              )}
              {selectedMetrics.includes("network") && (
                <ChartItem
                  key="network"
                  title="网络 (KB)"
                  data={chartData}
                  xKey="second"
                  height={224}
                  lines={[{ dataKey: "network", label: "网络", color: "hsl(120, 70%, 40%)" }]}
                />
              )}
            </ChartList>
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
