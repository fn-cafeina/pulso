import { useState, useEffect, useRef } from "react";
import { consultAI, getAIHistory } from "../../lib/api";
import { useToastStore } from "../../stores/toast";
import { useDelayedLoading } from "../../lib/useDelayedLoading";
import type { Message } from "./MessageBubble";

const CHARS_PER_TICK = 4;
const TICK_MS = 12;

let nextLocalId = -1;

export default function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastQuestion = useRef("");

  const showInitialLoader = useDelayedLoading(initialLoading);

  const loadHistory = async () => {
    try {
      const history = await getAIHistory();
      const mapped: Message[] = [];
      for (const item of history) {
        mapped.push({ id: item.id * 2, role: "user", content: item.pregunta });
        mapped.push({ id: item.id * 2 + 1, role: "ai", content: item.respuesta });
      }
      setMessages(mapped);
    } catch {
      useToastStore.getState().add("Error al cargar historial", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const id = setTimeout(() => loadHistory());
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const cancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStreaming(false);
    setLoading(false);
  };

  const handleSend = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    lastQuestion.current = question;
    setInput("");
    setError("");
    setLoading(true);
    const userMsgId = nextLocalId--;
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: question }]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await consultAI(question, controller.signal);
      if (controller.signal.aborted) return;
      const fullText = result.respuesta;
      if (!fullText) {
        setLoading(false);
        return;
      }

      const aiMsgId = result.id * 2 + 1;
      setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", content: "" }]);
      setLoading(false);
      setStreaming(true);

      let idx = 0;
      timerRef.current = setInterval(() => {
        idx += CHARS_PER_TICK;
        if (idx >= fullText.length) {
          idx = fullText.length;
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setStreaming(false);
        }
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.id === aiMsgId) {
            updated[updated.length - 1] = { ...last, content: fullText.slice(0, idx) };
          }
          return updated;
        });
      }, TICK_MS);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStreaming(false);
      setLoading(false);
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "0";
      ta.style.height = Math.min(Math.max(ta.scrollHeight, 40), 96) + "px";
    }
  };

  return {
    messages,
    input,
    setInput,
    loading,
    streaming,
    initialLoading: showInitialLoader,
    error,
    messagesEndRef,
    textareaRef,
    handleSend,
    handleKeyDown,
    handleInput,
    setError,
    cancel,
    retry: () => handleSend(lastQuestion.current),
  };
}
