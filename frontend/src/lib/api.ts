import { getAuth, setAuth } from "../stores/auth";
import type { ApiResponse } from "../types";

const API_BASE = "http://localhost:8080";

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const { token } = getAuth();
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
      throw new Error("No se pudo conectar con el servidor", { cause: err });
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
  const res = await apiFetch<{ token: string; rol: string }>("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const { token, rol } = res.data!;
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

export async function consultAI(pregunta: string, signal?: AbortSignal): Promise<{ id: number; pregunta: string; respuesta: string; created_at: string }> {
  const res = await apiFetch<{ id: number; pregunta: string; respuesta: string; created_at: string }>("/ai/consult", {
    method: "POST",
    body: JSON.stringify({ pregunta }),
    signal,
  });
  return res.data!;
}

export async function getAIHistory(): Promise<{ id: number; pregunta: string; respuesta: string; created_at: string }[]> {
  const res = await apiFetch<{ id: number; pregunta: string; respuesta: string; created_at: string }[]>("/ai/history");
  return res.data ?? [];
}
