import { useState, useEffect, useRef } from "react";
import { consultAI, getAIHistory } from "../../lib/api";
import { useToastStore } from "../../stores/toast";
import { useDelayedLoading } from "../../lib/useDelayedLoading";
import type { Message } from "./MessageBubble";

const CHARS_PER_TICK = 4;
const TICK_MS = 12;

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

  const showInitialLoader = useDelayedLoading(initialLoading);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getAIHistory();
      const mapped: Message[] = [];
      for (const item of history) {
        mapped.push({ role: "user", content: item.pregunta });
        mapped.push({ role: "ai", content: item.respuesta });
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

  const handleSend = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const result = await consultAI(question);
      const fullText = result.respuesta;
      if (!fullText) {
        setLoading(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "ai", content: "" }]);
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
          updated[updated.length - 1] = { role: "ai", content: fullText.slice(0, idx) };
          return updated;
        });
      }, TICK_MS);
    } catch (err: any) {
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
  };
}
