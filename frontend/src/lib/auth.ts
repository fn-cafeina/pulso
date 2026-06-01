import { useState, useEffect } from "react";

const TOKEN_KEY = "token";
const ROL_KEY = "rol";
const USERNAME_KEY = "username";

function getItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function setItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

function removeItem(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

function getSnapshot(): AuthState {
  return {
    token: getItem(TOKEN_KEY),
    rol: getItem(ROL_KEY),
    username: getItem(USERNAME_KEY),
  };
}

export interface AuthState {
  token: string | null;
  rol: string | null;
  username: string | null;
}

export function getAuth(): AuthState {
  return getSnapshot();
}

export function setAuth(token: string, rol: string, username: string) {
  setItem(TOKEN_KEY, token);
  setItem(ROL_KEY, rol);
  setItem(USERNAME_KEY, username);
}

export function clearAuth() {
  removeItem(TOKEN_KEY);
  removeItem(ROL_KEY);
  removeItem(USERNAME_KEY);
}

function decodeToken(token: string): any {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export function isAuthenticated(): boolean {
  const { token } = getAuth();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearAuth();
    return false;
  }
  return true;
}

export function useAuth(): AuthState & { isAuthenticated: boolean; hydrated: boolean } {
  const [state, setState] = useState<AuthState>({ token: null, rol: null, username: null });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(getSnapshot());
    setHydrated(true);
    const onStorage = () => setState(getSnapshot());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return {
    ...state,
    hydrated,
    isAuthenticated: !!state.token && !isTokenExpired(state.token),
  };
}
