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
import { AppWindow } from "lucide-react"
import { useRef, useState } from "react"
import type { AdbApp } from "@/types/adb"

interface Props {
  value: string
  apps: AdbApp[]
  search: string
  disabled?: boolean
  loading: boolean
  error?: string | null
  onChange: (value: string) => void
  onSearch: (value: string) => void
  onRefresh: () => void
}

export function AppSelect({
  value,
  apps,
  search,
  disabled,
  loading,
  error,
  onChange,
  onSearch,
  onRefresh,
}: Props) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selectedApp = apps.find(app => app.package === value)
  const installedApps = apps.filter((app) => !app.is_system)
  const systemApps = apps.filter((app) => app.is_system)

  return (
    <Popover
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen)
          if (newOpen && !disabled) {
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
            disabled={disabled}
          >
            {selectedApp ? (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <AppWindow className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedApp.package}</span>
                </div>
                {selectedApp.label && (
                  <span className="text-xs text-muted-foreground">{selectedApp.label}</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AppWindow className="h-4 w-4 text-muted-foreground" />
                <span>选择应用</span>
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
              placeholder="搜索包名"
              value={search}
              onValueChange={onSearch}
              disabled={disabled}
            />
            <CommandList>
              {disabled ? (
                <CommandEmpty>请先选择设备</CommandEmpty>
              ) : loading ? (
                <CommandEmpty>加载中...</CommandEmpty>
              ) : error ? (
                <CommandEmpty className="text-destructive">{error}</CommandEmpty>
              ) : apps.length === 0 ? (
                <CommandEmpty>未找到应用</CommandEmpty>
              ) : (
                <>
                  {installedApps.length > 0 && (
                    <CommandGroup heading="安装应用">
                      {installedApps.map((app) => (
                        <CommandItem
                          key={app.package}
                          value={app.package}
                          onSelect={() => {
                            onChange(app.package)
                            setOpen(false)
                          }}
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium truncate" title={app.package}>{app.package}</span>
                            {app.label ? (
                              <span className="text-xs text-muted-foreground truncate" title={app.label}>{app.label}</span>
                            ) : null}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {systemApps.length > 0 && (
                    <CommandGroup heading="系统应用">
                      {systemApps.map((app) => (
                        <CommandItem
                          key={app.package}
                          value={app.package}
                          onSelect={() => {
                            onChange(app.package)
                            setOpen(false)
                          }}
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium truncate" title={app.package}>{app.package}</span>
                            {app.label ? (
                              <span className="text-xs text-muted-foreground truncate" title={app.label}>{app.label}</span>
                            ) : null}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
  )
}


