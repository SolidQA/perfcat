import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Smartphone, Battery, Cpu, MemoryStick, Wifi, Bluetooth, RefreshCw } from "lucide-react"
import { useDeviceStore } from "@/stores/use-device-store"
import { useDeviceDetails } from "@/hooks/queries/useDeviceDetails"

export function DeviceInfoPage() {
  const { selectedDevice } = useDeviceStore()
  const { details, loading, error, refresh } = useDeviceDetails(selectedDevice?.id || null)

  if (!selectedDevice) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6">
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  设备信息
                </CardTitle>
                <CardDescription>请选择一个设备来查看详细信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Smartphone className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>请先选择一个设备</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">设备信息</h2>
              <p className="text-muted-foreground">查看设备详细信息和状态</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-sm font-medium text-secondary-foreground">
                {selectedDevice.model || "未知型号"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                刷新
              </Button>
            </div>
          </div>

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="text-center text-destructive">
                  <p>获取设备信息失败：{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 基本信息 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">基本信息</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">设备ID:</span>
                    <span className="font-mono text-xs">{details?.id || selectedDevice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">型号:</span>
                    <span>{details?.model || selectedDevice.model || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">状态:</span>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${
                        details?.state === "device"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {details?.state === "device" ? "已连接" : "离线"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Android版本:</span>
                    <span>{details?.android_version || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API级别:</span>
                    <span>{details?.api_level || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">制造商:</span>
                    <span>{details?.manufacturer || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">品牌:</span>
                    <span>{details?.brand || "未知"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 电池信息 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">电池状态</CardTitle>
                <Battery className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">电量:</span>
                    <span>{details?.battery_level ? `${details.battery_level}%` : "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">温度:</span>
                    <span>{details?.battery_temp || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">状态:</span>
                    <span>{details?.battery_status || "未知"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 性能信息 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">性能概览</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPU核心:</span>
                    <span>{details?.cpu_info || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总内存:</span>
                    <span>{details?.memory_total || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">可用内存:</span>
                    <span>{details?.memory_available || "未知"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 网络信息 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">网络状态</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">屏幕分辨率:</span>
                    <span>{details?.screen_resolution || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">屏幕密度:</span>
                    <span>{details?.screen_density || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">产品代号:</span>
                    <span>{details?.product || "未知"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 存储信息 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">存储空间</CardTitle>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总容量:</span>
                    <span>{details?.storage_total || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">可用空间:</span>
                    <span>{details?.storage_available || "未知"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">连接方式:</span>
                    <span>USB/无线</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 连接信息 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">连接信息</CardTitle>
                <Bluetooth className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">连接方式:</span>
                    <span>USB/无线</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">设备ID:</span>
                    <span className="font-mono text-xs">{selectedDevice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ADB端口:</span>
                    <span>5555</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
