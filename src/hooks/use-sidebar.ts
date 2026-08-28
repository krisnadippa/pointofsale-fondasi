'use client'

import { create } from 'zustand'

interface SidebarStore {
  isCollapsed: boolean
  toggleCollapse: () => void
  setCollapsed: (val: boolean) => void
  isMobileOpen: boolean
  toggleMobileOpen: () => void
  setMobileOpen: (val: boolean) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isCollapsed: false,
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (val) => set({ isCollapsed: val }),
  isMobileOpen: false,
  toggleMobileOpen: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setMobileOpen: (val) => set({ isMobileOpen: val }),
}))
