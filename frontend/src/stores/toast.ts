import { create } from "zustand";

export type ToastType = "success" | "info" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

const DISMISS_MS = 4000;

let timer: ReturnType<typeof setTimeout> | undefined;

interface ToastState {
  current: Toast | null;
  add: (message: string, type?: ToastType) => void;
  dismiss: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  add: (message, type = "success") => {
    if (timer) clearTimeout(timer);
    set({ current: { message, type } });
    timer = setTimeout(() => set({ current: null }), DISMISS_MS);
  },
  dismiss: () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    set({ current: null });
  },
}));
