import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartList, ChartItem } from "@/components/charts/ChartList"
import { useMonitoringStore } from "@/stores/use-monitoring-store"
import { useDeviceStore } from "@/stores/use-device-store"
import { useAdbApps } from "@/hooks/queries/useAdbApps"
import { Cpu, Gauge, Zap, Database, ArrowUpDown, Smartphone } from "lucide-react"

export function PerfPage() {
  const { chartData, selectedMetrics, selectedApp } = useMonitoringStore()
  const { selectedDevice } = useDeviceStore()
  const { apps } = useAdbApps(selectedDevice?.id || null)

  // 获取当前测试应用的显示信息
  const currentApp = apps.find(app => app.package === selectedApp)
  const appDisplayName = currentApp?.label || selectedApp || "未选择应用"

  return (
    <div className="h-full flex flex-col">
      {/* 当前测试应用信息 - 固定在顶部 */}
      <div className="flex items-center gap-2 p-4 pb-2 border-b bg-background">
        <Smartphone size={14} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">测试应用:</span>
        <span className="text-sm font-medium">{appDisplayName}</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-semibold">性能图表</h3>
        <ChartList initialBrush={{ start: 0, end: 100 }}>
          {selectedMetrics.includes("cpu") && (
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
          {selectedMetrics.includes("fps") && (
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
          {selectedMetrics.includes("power") && (
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
          {selectedMetrics.includes("memory") && (
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
          {selectedMetrics.includes("traffic") && (
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
      </ScrollArea>
    </div>
  )
}
