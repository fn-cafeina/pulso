import { create } from "zustand";

interface AlertFiltersState {
  nivel: string
  soloActivas: boolean
  setNivel: (nivel: string) => void
  setSoloActivas: (soloActivas: boolean) => void
  limpiar: () => void
}

export const useAlertFiltersStore = create<AlertFiltersState>((set) => ({
  nivel: "",
  soloActivas: true,
  setNivel: (nivel) => set({ nivel }),
  setSoloActivas: (soloActivas) => set({ soloActivas }),
  limpiar: () => set({ nivel: "", soloActivas: true }),
}));
