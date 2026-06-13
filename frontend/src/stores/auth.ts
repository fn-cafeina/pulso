import { create } from "zustand";

const TOKEN_KEY = "token";
const ROL_KEY = "rol";
const USERNAME_KEY = "username";

interface AuthState {
  token: string | null;
  rol: string | null;
  username: string | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  setAuth: (token: string, rol: string, username: string) => void;
  clearAuth: () => void;
  initFromStorage: () => void;
}

function decodeToken(token: string): any {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  rol: null,
  username: null,
  hydrated: false,
  isAuthenticated: false,

  setAuth: (token, rol, username) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROL_KEY, rol);
    localStorage.setItem(USERNAME_KEY, username);
    set({ token, rol, username, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROL_KEY);
    localStorage.removeItem(USERNAME_KEY);
    set({ token: null, rol: null, username: null, isAuthenticated: false });
  },

  initFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const rol = localStorage.getItem(ROL_KEY);
    const username = localStorage.getItem(USERNAME_KEY);
    const valid = !!token && !isExpired(token);
    if (!valid && token) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROL_KEY);
      localStorage.removeItem(USERNAME_KEY);
    }
    set({
      token: valid ? token : null,
      rol: valid ? rol : null,
      username: valid ? username : null,
      hydrated: true,
      isAuthenticated: valid,
    });
  },
}));

export function getAuth() {
  const s = useAuthStore.getState();
  return { token: s.token, rol: s.rol, username: s.username };
}

export function setAuth(token: string, rol: string, username: string) {
  useAuthStore.getState().setAuth(token, rol, username);
}

