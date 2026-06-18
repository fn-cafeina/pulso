import { useMemo, useState, useCallback, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Stethoscope, User, Volume2, VolumeX } from "lucide-react";
import { getAuth } from "../../stores/auth";

const API_BASE = "http://localhost:8080";

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

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/`{1,3}[^`\n]*`{1,3}/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^###\s+/gm, "")
    .replace(/^##\s+/gm, "")
    .replace(/^#\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/---+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
}

export default function MessageBubble({ msg }: { msg: Message }) {
  const normalized = useMemo(() => normalizeMarkdown(msg.content), [msg.content]);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const handleSpeak = useCallback(async () => {
    if (speaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      setSpeaking(false);
      return;
    }

    const { token } = getAuth();
    if (!token) return;

    setSpeaking(true);

    try {
      const resp = await fetch(`${API_BASE}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: stripMarkdown(msg.content) }),
      });

      if (!resp.ok) {
        setSpeaking(false);
        return;
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        urlRef.current = null;
        audioRef.current = null;
        setSpeaking(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        urlRef.current = null;
        audioRef.current = null;
        setSpeaking(false);
      };
      audio.play();
    } catch {
      setSpeaking(false);
    }
  }, [msg.content, speaking]);

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
        <div className={`px-4 py-3 rounded-bubble text-sm leading-relaxed overflow-hidden break-words animate-scale-in ${
          msg.role === "user"
            ? "bg-primary text-white rounded-br-md"
            : "bg-surface border border-gray/20 text-text rounded-bl-md"
        }`}>
          {msg.role === "user" ? (
            msg.content
          ) : (
            <>
              <div className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:text-sm prose-headings:font-semibold prose-strong:text-text max-w-none">
                <Markdown remarkPlugins={[remarkGfm]}>{normalized}</Markdown>
              </div>
              <button
                onClick={handleSpeak}
                className="mt-2 flex items-center gap-1 text-xs text-gray hover:text-text transition-colors cursor-pointer"
                aria-label={speaking ? "Detener" : "Escuchar"}
                title={speaking ? "Detener" : "Escuchar"}
              >
                {speaking ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                {speaking ? "Detener" : "Escuchar"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
