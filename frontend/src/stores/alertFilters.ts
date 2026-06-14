import { create } from "zustand";

interface AlertFiltersState {
  nivel: string
  soloActivas: boolean
  departamento: string
  page: number
  perPage: number
  setNivel: (nivel: string) => void
  setSoloActivas: (soloActivas: boolean) => void
  setDepartamento: (departamento: string) => void
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
  limpiar: () => void
}

export const useAlertFiltersStore = create<AlertFiltersState>((set) => ({
  nivel: "",
  soloActivas: true,
  departamento: "",
  page: 1,
  perPage: 10,
  setNivel: (nivel) => set({ nivel, page: 1 }),
  setSoloActivas: (soloActivas) => set({ soloActivas, page: 1 }),
  setDepartamento: (departamento) => set({ departamento, page: 1 }),
  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage, page: 1 }),
  limpiar: () => set({ nivel: "", soloActivas: true, departamento: "", page: 1 }),
}));
