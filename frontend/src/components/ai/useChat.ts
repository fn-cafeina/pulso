import { useState, useEffect, useRef } from "react";
import { consultAIStream, getAIHistory } from "../../lib/api";
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
  const abortRef = useRef<AbortController | null>(null);
  const lastQuestion = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullTextRef = useRef("");

  const showInitialLoader = useDelayedLoading(initialLoading);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
    const userMsgId = nextLocalId--;
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: question }]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const aiMsgId = nextLocalId--;
    setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", content: "" }]);
    setLoading(false);
    setStreaming(true);

    fullTextRef.current = "";
    let resolvedId: number | null = null;

    try {
      // Stream in background — accumulates text, resolves with consultation id
      const streamPromise = consultAIStream(question, controller.signal, (chunk) => {
        fullTextRef.current += chunk;
      });

      // Typing animation — reads from ref smoothly
      await new Promise<void>((resolve, reject) => {
        let idx = 0;
        const timer = setInterval(() => {
          const buf = fullTextRef.current;
          const prevIdx = idx;
          idx = Math.min(idx + CHARS_PER_TICK, buf.length);
          if (idx > prevIdx) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.id === aiMsgId) {
                updated[updated.length - 1] = { ...last, content: buf.slice(0, idx) };
              }
              return updated;
            });
          }
          // Done when stream finished AND typing caught up
          if (resolvedId !== null && idx >= buf.length) {
            clearInterval(timer);
            setStreaming(false);
            resolve();
          }
        }, TICK_MS);
        timerRef.current = timer;

        streamPromise
          .then((id) => { resolvedId = id; })
          .catch((e) => { clearInterval(timer); reject(e); });
      });

      if (controller.signal.aborted) return;

      // Replace temp ids with real ones from backend
      if (resolvedId !== null) {
        const realUserId = resolvedId * 2;
        const realAiId = resolvedId * 2 + 1;
        setMessages((prev) => prev.map((m) => {
          if (m.id === userMsgId) return { ...m, id: realUserId };
          if (m.id === aiMsgId) return { ...m, id: realAiId };
          return m;
        }));
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setStreaming(false);
      setLoading(false);
      setError(err.message);
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
