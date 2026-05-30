const API_BASE = "http://localhost:8080";

function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function safeSetItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

function safeRemoveItem(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function getToken(): string | null {
  return safeGetItem("token");
}

export function getRole(): string | null {
  return safeGetItem("rol");
}

export function getUsername(): string | null {
  return safeGetItem("username");
}

export function setAuth(token: string, rol: string, username: string) {
  safeSetItem("token", token);
  safeSetItem("rol", rol);
  safeSetItem("username", username);
}

export function clearAuth() {
  safeRemoveItem("token");
  safeRemoveItem("rol");
  safeRemoveItem("username");
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
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearAuth();
    return false;
  }
  return true;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error("No se pudo conectar con el servidor");
    }
    throw err;
  }

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.error || "Error del servidor");
  }

  return body;
}

export async function login(
  username: string,
  password: string
): Promise<{ token: string; rol: string }> {
  const res = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const { token, rol } = res.data;
  setAuth(token, rol, username);
  return { token, rol };
}

export async function register(data: {
  username: string;
  password: string;
  antecedentes_medicos?: string;
  codigo?: string;
}): Promise<void> {
  await apiFetch("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
