import { TabbedHeader } from "@/components/header"
import { PerfPage } from "@/pages/perf-page"
import { DeviceInfoPage } from "@/pages/device-info-page"
import { ReportPage } from "@/pages/report-page"
import { useDeviceEffects } from "@/hooks/effects/useDeviceEffects"
import { useAppStore } from "@/stores/use-app-store"
import { Tabs, TabsContent } from "@/components/ui/tabs"

export function HomePage() {
  const { activeTab, setActiveTab } = useAppStore()

  // 处理设备变化副作用
  useDeviceEffects()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TabbedHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-hidden min-h-0">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="performance" className="h-full m-0">
            <PerfPage />
          </TabsContent>

          <TabsContent value="device" className="h-full m-0">
            <DeviceInfoPage />
          </TabsContent>

          <TabsContent value="report" className="h-full m-0">
            <ReportPage />
          </TabsContent>
        </Tabs>
      </main>

    </div>
  )
}
