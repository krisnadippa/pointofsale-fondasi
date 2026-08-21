'use client'

import { create } from 'zustand'

interface SidebarStore {
  isCollapsed: boolean
  toggleCollapse: () => void
  setCollapsed: (val: boolean) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isCollapsed: false,
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (val) => set({ isCollapsed: val }),
}))
