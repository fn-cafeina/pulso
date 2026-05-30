const API_BASE = "http://localhost:8080";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getRole(): string | null {
  return localStorage.getItem("rol");
}

export function getUsername(): string | null {
  return localStorage.getItem("username");
}

export function setAuth(token: string, rol: string, username: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("rol", rol);
  localStorage.setItem("username", username);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("username");
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

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

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
