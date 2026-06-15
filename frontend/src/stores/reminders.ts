import { create } from "zustand";
import { createCrudApi } from "../lib/createCrudApi";
import { apiFetch } from "../lib/api";
import type { Reminder } from "../types";

interface RemindersState {
  items: Reminder[]
  history: Reminder[]
  loading: boolean
  error: string | null
  fetch: () => Promise<void>
  fetchHistory: () => Promise<void>
  add: (data: Record<string, unknown>) => Promise<Reminder>
  markRead: (id: number) => Promise<void>
  clearError: () => void
}

const api = createCrudApi<Reminder>("/reminders");

export const useRemindersStore = create<RemindersState>((set) => ({
  items: [],
  history: [],
  loading: false,
  error: null,

  async fetch() {
    set({ loading: true, error: null })
    try {
      const { items } = await api.list()
      set({ items, loading: false })
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Error desconocido", loading: false })
    }
  },

  async fetchHistory() {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<Reminder[]>("/reminders/history")
      set({ history: res.data ?? [], loading: false })
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Error desconocido", loading: false })
    }
  },

  async add(data: Record<string, unknown>) {
    set({ loading: true, error: null })
    try {
      const item = await api.create(data)
      set((s) => ({ items: [...s.items, item], loading: false }))
      return item as Reminder
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Error desconocido", loading: false })
      throw err
    }
  },

  async markRead(id: number) {
    try {
      await api.action(id, "read")
      set((s) => ({
        items: s.items.map((r) => (r.id === id ? { ...r, leido: true } : r)),
      }))
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Error desconocido" })
    }
  },

  clearError: () => set({ error: null }),
}))
