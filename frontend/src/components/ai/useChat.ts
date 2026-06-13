import { useState, useEffect, useRef } from "react";
import { consultAI, getAIHistory } from "../../lib/api";
import { useDelayedLoading } from "../../lib/useDelayedLoading";
import type { Message } from "./MessageBubble";

export default function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showInitialLoader = useDelayedLoading(initialLoading);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Silently ignore history load errors
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
      setMessages((prev) => [...prev, { role: "ai", content: result.respuesta }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
