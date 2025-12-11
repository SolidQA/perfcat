import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Play, Square, Settings } from "lucide-react"
import { useRef } from "react"

interface Props {
  disabled: boolean
  running: boolean
  onStart: () => void
  onStop: () => void
  metricSelector?: React.ReactNode
}

export function CommandBar({ disabled, running, onStart, onStop, metricSelector }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="flex items-center justify-end gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={running}
            aria-label="选择性能指标"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-3"
          align="end"
          style={{ width: triggerRef.current?.offsetWidth ? triggerRef.current.offsetWidth * 3 : 240 }}
        >
          {metricSelector ?? <div className="text-sm text-muted-foreground">请选择性能参数</div>}
        </PopoverContent>
      </Popover>

      <Button
        variant={running ? "destructive" : "default"}
        size="icon"
        className="rounded-full"
        onClick={running ? onStop : onStart}
        disabled={disabled}
        aria-label={running ? "停止监控" : "开始监控"}
      >
        {running ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    </div>
  )
}


