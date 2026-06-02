interface Props {
  onSend: (text: string) => void;
}

const suggestions = [
  "¿Qué puedo hacer para el dolor de cabeza?",
  "¿Cuáles son los síntomas de la influenza?",
  "¿Cuándo debo acudir al centro de salud?",
];

export default function SuggestionsPanel({ onSend }: Props) {
  return (
    <div className="space-y-2 w-full max-w-sm">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSend(s)}
          className="w-full text-left px-4 py-3 bg-white border border-gray/20 rounded-xl text-sm text-text hover:bg-gray/5 hover:border-primary/30 transition-colors cursor-pointer"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
