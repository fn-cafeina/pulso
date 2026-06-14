import { create } from "zustand";

export type ToastType = "success" | "info" | "error";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const DISMISS_MS = 4000;
const timers = new Map<number, ReturnType<typeof setTimeout>>();
let nextId = 1;

interface ToastState {
  queue: Toast[];
  add: (message: string, type?: ToastType) => void;
  dismiss: (id: number) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  queue: [],
  add: (message, type = "success") => {
    const id = nextId++;
    set((s) => ({ queue: [...s.queue, { id, message, type }] }));
    const timer = setTimeout(() => {
      get().dismiss(id);
    }, DISMISS_MS);
    timers.set(id, timer);
  },
  dismiss: (id: number) => {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    set((s) => ({ queue: s.queue.filter((t) => t.id !== id) }));
  },
}));
