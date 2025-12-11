import { AppSelect } from "@/components/sidebar/AppSelect"
import { CommandBar } from "@/components/sidebar/CommandBar"
import { DeviceSelect } from "@/components/sidebar/DeviceSelect"
import { MetricSelector } from "@/components/sidebar/MetricSelector"
import type { AdbApp, AdbDevice, MetricKey } from "@/types/adb"

interface HeaderProps {
  deviceId: string
  devices: AdbDevice[]
  deviceSearch: string
  loadingDevices: boolean
  onDeviceChange: (value: string) => void
  onDeviceSearch: (value: string) => void
  onRefreshDevices: () => void

  appId: string
  apps: AdbApp[]
  appSearch: string
  loadingApps: boolean
  appError?: string | null
  onRefreshApps: () => void
  onAppChange: (value: string) => void
  onAppSearch: (value: string) => void

  metrics: MetricKey[]
  onMetricsChange: (value: MetricKey[]) => void

  running: boolean
  onStart: () => void
  onStop: () => void
}

export function HeaderBar(props: HeaderProps) {
  const {
    deviceId,
    devices,
    deviceSearch,
    loadingDevices,
    onDeviceChange,
    onDeviceSearch,
    onRefreshDevices,
    appId,
    apps,
    appSearch,
    loadingApps,
    appError,
    onRefreshApps,
    onAppChange,
    onAppSearch,
    metrics,
    onMetricsChange,
    running,
    onStart,
    onStop,
  } = props

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex min-w-[280px] flex-1 flex-wrap items-start gap-3">
            <div className="w-full min-w-[220px] sm:w-64">
              <DeviceSelect
                value={deviceId}
                devices={devices}
                search={deviceSearch}
                loading={loadingDevices}
                onChange={onDeviceChange}
                onSearch={onDeviceSearch}
                onRefresh={onRefreshDevices}
              />
            </div>

            <div className="w-full min-w-[220px] sm:w-64">
              <AppSelect
                value={appId}
                apps={apps}
                search={appSearch}
                loading={loadingApps}
                error={appError}
                onRefresh={onRefreshApps}
                disabled={!deviceId}
                onChange={onAppChange}
                onSearch={onAppSearch}
              />
            </div>
          </div>

          <div className="w-full min-w-[240px] flex-shrink-0 sm:ml-auto sm:w-[260px]">
            <CommandBar
              disabled={!deviceId || !appId || metrics.length === 0}
              running={running}
              onStart={onStart}
              onStop={onStop}
              metricSelector={
                <MetricSelector value={metrics} onChange={onMetricsChange} disabled={running} />
              }
            />
          </div>
        </div>
      </div>
    </header>
  )
}

