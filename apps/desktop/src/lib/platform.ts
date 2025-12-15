import { open } from "@tauri-apps/plugin-shell"

let platform: "macos" | "windows" | "linux" | null = null

export async function getPlatform(): Promise<"macos" | "windows" | "linux"> {
  if (platform) {
    return platform
  }

  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.includes("mac")) {
    platform = "macos"
  } else if (userAgent.includes("win")) {
    platform = "windows"
  } else {
    platform = "linux"
  }

  return platform
}

/**
 * 打开外部链接（使用Tauri的shell插件）
 */
export async function openExternalUrl(url: string): Promise<void> {
  try {
    await open(url)
  } catch (error) {
    console.error("Failed to open external URL:", error)
    // 降级到使用window.open
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
