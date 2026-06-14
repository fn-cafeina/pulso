import { useState, useEffect, useRef } from "react";
import { consultAIStream, getAIHistory } from "../../lib/api";
import { useToastStore } from "../../stores/toast";
import { useDelayedLoading } from "../../lib/useDelayedLoading";
import type { Message } from "./MessageBubble";

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

    const aiMsgId = nextLocalId--;
    setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", content: "" }]);
    setLoading(false);
    setStreaming(true);

    try {
      let fullText = "";
      const id = await consultAIStream(question, controller.signal, (chunk) => {
        fullText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.id === aiMsgId) {
            updated[updated.length - 1] = { ...last, content: fullText };
          }
          return updated;
        });
      });
      if (controller.signal.aborted) return;
      // replace temp ids with real ones from backend
      const realUserId = id * 2;
      const realAiId = id * 2 + 1;
      setMessages((prev) => prev.map((m) => {
        if (m.id === userMsgId) return { ...m, id: realUserId };
        if (m.id === aiMsgId) return { ...m, id: realAiId };
        return m;
      }));
      setStreaming(false);
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
