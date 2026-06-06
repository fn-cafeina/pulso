import { Loader2, Stethoscope, AlertTriangle } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import SuggestionsPanel from "./SuggestionsPanel";
import useChat from "./useChat";

export default function ChatInterface() {
  const {
    messages, input, loading, initialLoading, error,
    messagesEndRef, textareaRef,
    handleSend, handleKeyDown, handleInput,
    setInput, setError,
  } = useChat();

  return (
    <div className="flex flex-col h-full">
      <div className="max-md:hidden bg-surface border-b border-gray/20 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-text">Asistente de Salud</h2>
          <p className="text-xs text-gray">Orientación basada en tu perfil de salud</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [overscroll-behavior:contain]">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-float">
              <Stethoscope className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">¿Cómo puedo ayudarte?</h3>
            <p className="text-sm text-gray max-w-sm mb-6">
              Orientación sobre síntomas, cuándo acudir al centro de salud, y información de salud contextualizada.
            </p>
            <SuggestionsPanel onSend={handleSend} />
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray/10 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-4 h-4 text-gray" />
                  </div>
                  <div className="px-4 py-3 bg-surface border border-gray/20 rounded-bubble rounded-bl-md animate-scale-in">
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
        <div className="mx-4 mb-2 flex items-center gap-2 px-4 py-2 bg-warning/10 border border-warning/30 text-warning rounded-button text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="border-t border-gray/20 bg-surface px-4 py-3">
        <ChatInput
          input={input}
          loading={loading}
          textareaRef={textareaRef}
          onInputChange={setInput}
          onSend={() => handleSend()}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onErrorClear={() => setError("")}
        />
        <p className="text-xs text-gray mt-2 text-center">
          Pulso orienta, no diagnostica ni receta medicamentos.
        </p>
      </div>
    </div>
  );
}
