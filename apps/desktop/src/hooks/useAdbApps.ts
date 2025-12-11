import { useCallback, useEffect, useMemo, useState } from "react"
import { listApps } from "@/lib/tauri-adb"
import type { AdbApp } from "@/types/adb"

export function useAdbApps(deviceId: string | null) {
  const [apps, setApps] = useState<AdbApp[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!deviceId) {
      setApps([])
      return
    }
    setLoading(true)
    try {
      // 刷新时获取全量数据，不传搜索参数
      const result = await listApps(deviceId, undefined)
      setApps(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [deviceId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filtered = useMemo(() => {
    if (!search.trim()) return apps
    const keyword = search.toLowerCase()
    return apps.filter((app) => {
      const pkgHit = app.package.toLowerCase().includes(keyword)
      const labelHit = app.label?.toLowerCase().includes(keyword)
      return pkgHit || labelHit
    })
  }, [apps, search])

  return {
    apps: filtered,
    rawApps: apps,
    search,
    setSearch,
    loading,
    error,
    refresh,
  }
}


