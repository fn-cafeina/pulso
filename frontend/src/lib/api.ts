import { getAuth, setAuth } from "../stores/auth";
import type { ApiResponse } from "../types";

const API_BASE = "http://localhost:8080";

export async function apiFetch<T = any>(
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

export async function consultAIStream(
  pregunta: string,
  signal: AbortSignal,
  onChunk: (chunk: string) => void,
): Promise<number> {
  const { token } = getAuth();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("http://localhost:8080/ai/consult/stream", {
    method: "POST",
    headers,
    body: JSON.stringify({ pregunta }),
    signal,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error del servidor");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Streaming not supported");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    let eventType = "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7);
      } else if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (eventType === "done") {
          return parseInt(data, 10);
        }
        if (eventType === "error") {
          throw new Error(data);
        }
        // default event: content chunk
        if (data) onChunk(data);
        eventType = "";
      }
    }
  }

  throw new Error("Stream ended without completion event");
}

export async function getAIHistory(): Promise<{ id: number; pregunta: string; respuesta: string; created_at: string }[]> {
  const res = await apiFetch("/ai/history");
  return res.data || [];
}
