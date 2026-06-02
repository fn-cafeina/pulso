import { useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Stethoscope, User } from "lucide-react";

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

export interface Message {
  role: "user" | "ai";
  content: string;
}

export default function MessageBubble({ msg }: { msg: Message }) {
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
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed overflow-hidden break-words ${
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
