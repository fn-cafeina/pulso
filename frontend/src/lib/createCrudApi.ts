import { apiFetch } from "./api";
import type { PaginationMeta } from "../types";

export interface CrudApi<T, Q = Record<string, any>> {
  list(params?: Q): Promise<{ items: T[]; meta?: PaginationMeta }>
  getById(id: number): Promise<T>
  create(data: Record<string, any>): Promise<T>
  update(id: number, data: Record<string, any>): Promise<T>
  del(id: number): Promise<void>
  action(id: number, actionName: string, method?: string): Promise<void>
}

function toQueryString(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  )
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")
}

export function createCrudApi<T, Q = Record<string, any>>(basePath: string): CrudApi<T, Q> {
  return {
    async list(params?: Q) {
      const query = params ? toQueryString(params as Record<string, any>) : ""
      const res = await apiFetch<T[]>(`${basePath}${query}`)
      return { items: res.data ?? [], meta: res.meta }
    },

    async getById(id: number) {
      const res = await apiFetch<T>(`${basePath}/${id}`)
      return res.data as T
    },

    async create(data: Record<string, any>) {
      const res = await apiFetch<T>(basePath, {
        method: "POST",
        body: JSON.stringify(data),
      })
      return res.data as T
    },

    async update(id: number, data: Record<string, any>) {
      const res = await apiFetch<T>(`${basePath}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return res.data as T
    },

    async del(id: number) {
      await apiFetch(`${basePath}/${id}`, { method: "DELETE" })
    },

    async action(id: number, actionName: string, method = "PATCH") {
      await apiFetch(`${basePath}/${id}/${actionName}`, { method })
    },
  }
}
