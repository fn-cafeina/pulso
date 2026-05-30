import { useState, useEffect, useRef, useMemo } from "react";
import { consultAI, getAIHistory } from "../../lib/api";
import { Send, Loader2, Stethoscope, User, AlertTriangle } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function normalizeMarkdown(text: string): string {
  let result = text;

  result = result.replace(/^[\u2022\u25CF\u25CB]\s*/gm, "- ");

  const lines = result.split("\n");
  const normalized: string[] = [];
  let afterColon = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.endsWith(":")) {
      afterColon = true;
      normalized.push(line);
      continue;
    }

    if (
      afterColon &&
      trimmed.length > 0 &&
      trimmed.length < 150 &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("*") &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith(">") &&
      !trimmed.startsWith("¿") &&
      !trimmed.startsWith("!") &&
      !/^\d+\./.test(trimmed)
    ) {
      normalized.push("- " + trimmed);
    } else {
      if (trimmed.length > 0) afterColon = false;
      normalized.push(line);
    }
  }

  return normalized.join("\n");
}

interface Message {
  role: "user" | "ai";
  content: string;
}

const suggestions = [
  "¿Qué puedo hacer para el dolor de cabeza?",
  "¿Cuáles son los síntomas de la influenza?",
  "¿Cuándo debo acudir al centro de salud?",
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen -mx-4 md:mx-0">
      <div className="bg-white border-b border-gray/20 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-text">Asistente de Salud</h2>
          <p className="text-xs text-gray">Orientación basada en tu perfil de salud</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">¿Cómo puedo ayudarte?</h3>
            <p className="text-sm text-gray max-w-sm mb-6">
              Orientación sobre síntomas, cuándo acudir al centro de salud, y información de salud contextualizada.
            </p>
            <div className="space-y-2 w-full max-w-sm">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="w-full text-left px-4 py-3 bg-white border border-gray/20 rounded-xl text-sm text-text hover:bg-gray/5 hover:border-primary/30 transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} onSend={handleSend} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray/10 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-4 h-4 text-gray" />
                  </div>
                  <div className="px-4 py-3 bg-white border border-gray/20 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-4 py-2 bg-warning/10 border border-warning/30 text-warning rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="border-t border-gray/20 bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Describe tus síntomas o haz una pregunta..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray/30 bg-neutral px-4 py-2.5 text-sm text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
            aria-label="Enviar mensaje"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray mt-2 text-center">
          Pulso orienta, no diagnostica ni receta medicamentos.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onSend }: { msg: Message; onSend: (text: string) => void }) {
  const normalized = useMemo(() => normalizeMarkdown(msg.content), [msg.content]);

  return (
    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          msg.role === "user" ? "bg-primary/10" : "bg-gray/10"
        }`}>
          {msg.role === "user" ? (
            <User className="w-4 h-4 text-primary" />
          ) : (
            <Stethoscope className="w-4 h-4 text-gray" />
          )}
        </div>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          msg.role === "user"
            ? "bg-primary text-white rounded-br-md"
            : "bg-white border border-gray/20 text-text rounded-bl-md"
        }`}>
          {msg.role === "user" ? (
            msg.content
          ) : (
            <div className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:text-sm prose-headings:font-semibold prose-strong:text-text max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}>{normalized}</Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
