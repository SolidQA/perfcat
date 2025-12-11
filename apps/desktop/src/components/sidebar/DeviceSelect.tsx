import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Smartphone } from "lucide-react"
import { useRef, useState } from "react"
import type { AdbDevice } from "@/types/adb"

interface Props {
  value: string
  devices: AdbDevice[]
  search: string
  loading: boolean
  onChange: (value: string) => void
  onSearch: (value: string) => void
  onRefresh: () => void
}

export function DeviceSelect({
  value,
  devices,
  search,
  loading,
  onChange,
  onSearch,
  onRefresh,
}: Props) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selectedDevice = devices.find(device => device.id === value)
  const titleText = selectedDevice
    ? `${selectedDevice.model ?? "未知"} · ${selectedDevice.state}`
    : "选择设备"

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen)
          if (newOpen) {
            onRefresh()
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            title={titleText}
          >
            {selectedDevice ? (
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span>{selectedDevice.id}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span>选择设备</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: triggerRef.current?.offsetWidth || 'auto' }}
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="搜索设备"
              value={search}
              onValueChange={onSearch}
              disabled={loading}
            />
            <CommandList>
              {loading ? (
                <CommandEmpty>加载中...</CommandEmpty>
              ) : devices.length === 0 ? (
                <CommandEmpty>暂无设备</CommandEmpty>
              ) : (
                <CommandGroup>
                  {devices.map((device) => (
                    <CommandItem
                      key={device.id}
                      value={device.id}
                      onSelect={() => {
                        onChange(device.id)
                        setOpen(false)
                      }}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium truncate" title={device.id}>{device.id}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {device.model ?? "未知"} · {device.state}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}


