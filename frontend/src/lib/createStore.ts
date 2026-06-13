import { create } from "zustand";
import type { CrudApi } from "./createCrudApi";
import type { PaginationMeta } from "../types";

export interface CrudStore<T, Q = Record<string, any>> {
  items: T[]
  loading: boolean
  error: string | null
  meta?: PaginationMeta
  fetch: (params?: Q) => Promise<void>
  refresh: (params?: Q) => Promise<void>
  add: (data: Record<string, any>) => Promise<T>
  updateItem: (id: number, data: Record<string, any>) => Promise<T>
  removeItem: (id: number) => Promise<void>
  clearError: () => void
}

export function createCrudStore<T extends { id: number }, Q = Record<string, any>>(
  api: CrudApi<T, Q>
) {
  return create<CrudStore<T, Q>>((set) => ({
    items: [],
    loading: false,
    error: null,

    async fetch(params?: Q) {
      set({ loading: true, error: null })
      try {
        const { items, meta } = await api.list(params)
        set({ items, meta, loading: false })
      } catch (err: any) {
        set({ error: err.message, loading: false })
      }
    },

    async refresh(params?: Q) {
      try {
        const { items, meta } = await api.list(params)
        set({ items, meta, error: null })
      } catch (err: any) {
        set({ error: err.message })
      }
    },

    async add(data: Record<string, any>) {
      set({ loading: true, error: null })
      try {
        const item = await api.create(data)
        set((s) => ({ items: [...s.items, item], loading: false }))
        return item as T
      } catch (err: any) {
        set({ error: err.message, loading: false })
        throw err
      }
    },

    async updateItem(id: number, data: Record<string, any>) {
      set({ loading: true, error: null })
      try {
        const updated = await api.update(id, data)
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? updated : i)),
          loading: false,
        }))
        return updated as T
      } catch (err: any) {
        set({ error: err.message, loading: false })
        throw err
      }
    },

    async removeItem(id: number) {
      set({ loading: true, error: null })
      try {
        await api.del(id)
        set((s) => ({ items: s.items.filter((i) => i.id !== id), loading: false }))
      } catch (err: any) {
        set({ error: err.message, loading: false })
        throw err
      }
    },

    clearError: () => set({ error: null }),
  }))
}
