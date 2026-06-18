import { Mic, MicOff, Send, Square } from "lucide-react";

interface Props {
  input: string;
  loading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onInput: () => void;
  onErrorClear: () => void;
  voiceSupported: boolean;
  isListening: boolean;
  voiceInterim: string;
  onMicToggle: () => void;
}

export default function ChatInput({
  input,
  loading,
  textareaRef,
  onInputChange,
  onSend,
  onCancel,
  onKeyDown,
  onInput,
  onErrorClear,
  voiceSupported,
  isListening,
  voiceInterim,
  onMicToggle,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={isListening && voiceInterim ? (input ? input + " " + voiceInterim : voiceInterim) : input}
          readOnly={isListening}
          onChange={(e) => { onInputChange(e.target.value); onErrorClear(); }}
          onKeyDown={onKeyDown}
          onInput={onInput}
          placeholder={isListening ? "Escuchando..." : "Pregunta sobre tu salud..."}
          rows={1}
          className="flex-1 resize-none rounded-card border border-gray/30 bg-neutral px-4 py-2.5 text-base text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors overflow-y-auto"
        />
      {voiceSupported && (
        <button
          onClick={onMicToggle}
          disabled={loading}
          className={`p-2.5 rounded-card shadow hover:shadow-md active:shadow-sm active:scale-95 hover:scale-105 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            isListening
              ? "bg-error text-white animate-pulse"
              : "bg-neutral border border-gray/30 text-gray hover:text-text"
          }`}
          aria-label={isListening ? "Detener grabación" : "Hablar"}
          title={isListening ? "Detener" : "Hablar"}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      )}
      <button
        onClick={loading ? onCancel : onSend}
        disabled={!input.trim() && !loading}
        className="p-2.5 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-card shadow hover:shadow-md active:shadow-sm active:scale-95 hover:scale-105 transition-all cursor-pointer disabled:cursor-not-allowed"
        aria-label={loading ? "Cancelar" : "Enviar mensaje"}
      >
        {loading ? (
          <Square className="w-5 h-5" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
      </div>
    </div>
  );
}
