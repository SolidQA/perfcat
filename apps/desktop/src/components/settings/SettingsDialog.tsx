import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Github, CheckCircle, AlertCircle, Settings, Info } from "lucide-react"
import { useUpdateCheck } from "@/hooks/queries/useUpdateCheck"
import { openExternalUrl } from "@/lib/platform"
import { useState, useRef, useEffect } from "react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  // 应用信息
  const appInfo = {
    name: "PerfX",
    version: __APP_VERSION__,
    author: "SolidQA",
    githubUrl: "https://github.com/SolidQA/PerfX"
  }

  // 使用自动更新检查 hook
  const update = useUpdateCheck(appInfo.version)

  // 滚动相关的状态和ref
  const [activeSection, setActiveSection] = useState("general")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const sections = [
    { id: "general", label: "通用", icon: Settings },
    { id: "about", label: "关于", icon: Info }
  ]

  const handleOpenGitHub = () => {
    openExternalUrl(appInfo.githubUrl)
  }

  // 滚动监听函数
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop
    const sectionOffsets = sections.map(section => {
      const element = sectionRefs.current[section.id]
      return {
        id: section.id,
        offset: element ? element.offsetTop : 0
      }
    })

    // 找到当前滚动位置对应的章节
    let currentSection = sections[0].id
    for (let i = sectionOffsets.length - 1; i >= 0; i--) {
      if (scrollTop >= sectionOffsets[i].offset - 100) { // 100px的偏移量
        currentSection = sectionOffsets[i].id
        break
      }
    }

    setActiveSection(currentSection)
  }

  // 点击导航跳转到对应章节
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: element.offsetTop,
          behavior: 'smooth'
        })
      }
    }
  }

  // 初始化时设置默认章节
  useEffect(() => {
    setActiveSection("general")
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-96">
          {/* 左侧导航 */}
          <div className="w-48 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{section.label}</span>
                </button>
              )
            })}
          </div>

          {/* 右侧滚动内容 */}
          <div className="flex-1">
            <ScrollArea
              ref={scrollAreaRef}
              className="h-full"
              onScroll={handleScroll}
            >
              <div className="pr-4 space-y-8">
                {/* 通用章节 */}
                <div
                  ref={(el) => {
                    sectionRefs.current.general = el
                  }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">通用</h3>
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">暂无</div>
                  </div>
                </div>

                {/* 关于章节 */}
                <div
                  ref={(el) => {
                    sectionRefs.current.about = el
                  }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold">关于</h3>

                  {/* 应用信息 */}
                  <div className="space-y-2 text-center">
                    <div className="text-xl font-semibold">{appInfo.name}</div>
                    <div className="text-sm text-muted-foreground">版本 {appInfo.version}</div>
                    <div className="text-sm text-muted-foreground">开发者 {appInfo.author}</div>
                  </div>

                  <Separator />

                  {/* 更新状态 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-lg border">
                      {update.hasUpdate ? (
                        <>
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">发现新版本</div>
                            <div className="text-xs text-muted-foreground">
                              v{update.latestVersion} 可供下载
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (update.releaseUrl) {
                                openExternalUrl(update.releaseUrl)
                              }
                            }}
                          >
                            更新
                          </Button>
                        </>
                      ) : update.checking ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                          <div className="text-sm">检查更新中...</div>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div className="text-sm">已是最新版本</div>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleOpenGitHub}
                      className="w-full gap-2"
                    >
                      <Github className="h-4 w-4" />
                      访问GitHub
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
