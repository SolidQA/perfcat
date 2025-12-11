import { create } from "zustand"

import type { AdbDevice } from "@/types/adb"

interface AppState {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  selectedDevice: AdbDevice | null
  setSelectedDevice: (device: AdbDevice | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
  selectedDevice: null,
  setSelectedDevice: (device) => set({ selectedDevice: device }),
}))
