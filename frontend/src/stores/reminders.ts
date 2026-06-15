import { create } from "zustand";
import { createCrudApi } from "../lib/createCrudApi";
import { apiFetch } from "../lib/api";
import type { Reminder, PaginationMeta } from "../types";

interface RemindersState {
  items: Reminder[]
  history: Reminder[]
  meta: PaginationMeta | null
  loading: boolean
  loadingHistory: boolean
  error: string | null
  fetch: () => Promise<void>
  fetchHistory: (page?: number, perPage?: number) => Promise<void>
  add: (data: Record<string, unknown>) => Promise<Reminder>
  updateItem: (id: number, data: Record<string, unknown>) => Promise<Reminder>
  markRead: (id: number) => Promise<void>
  remove: (id: number) => Promise<void>
  clearError: () => void
}

const api = createCrudApi<Reminder>("/reminders");

export const useRemindersStore = create<RemindersState>((set) => ({
  items: [],
  history: [],
  meta: null,
  loading: false,
  loadingHistory: false,
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

  async fetchHistory(page?: number, perPage = 20) {
    set({ loadingHistory: true, error: null })
    try {
      const qs = page && page > 0 ? `?page=${page}&per_page=${perPage}` : ""
      const res = await apiFetch<Reminder[]>("/reminders/history" + qs)
      set({
        history: res.data ?? [],
        meta: res.meta ?? null,
        loadingHistory: false,
      })
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Error desconocido", loadingHistory: false })
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

  async updateItem(id: number, data: Record<string, unknown>) {
    set({ error: null })
    try {
      const updated = await api.update(id, data)
      set((s) => ({
        items: s.items.map((r) => (r.id === id ? updated : r)) as Reminder[],
        history: s.history.map((r) => (r.id === id ? updated : r)) as Reminder[],
      }))
      return updated as Reminder
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Error desconocido" })
      throw err
    }
  },

  async markRead(id: number) {
    await api.action(id, "read")
    set((s) => {
      const item = s.items.find((r) => r.id === id)
      if (!item) return s
      return {
        items: s.items.filter((r) => r.id !== id),
        history: [{ ...item, leido: true } as Reminder, ...s.history.filter((r) => r.id !== id)],
      }
    })
  },

  async remove(id: number) {
    try {
      await api.del(id)
      set((s) => ({
        items: s.items.filter((r) => r.id !== id),
        history: s.history.filter((r) => r.id !== id),
      }))
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Error desconocido" })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
