import { Sun, Moon } from "lucide-react";
import { useState } from "react";
import { STORAGE_KEY } from "../../lib/theme";

interface Props {
  compact?: boolean;
}

export default function ThemeToggle({ compact }: Props) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = next ? "#1a1814" : "#fef9f0";
  };

  if (compact) {
    return (
      <button
        onClick={toggle}
        className="flex items-center justify-center p-2 text-gray hover:text-text hover:bg-gray/10 rounded-button transition-colors cursor-pointer"
        aria-label={dark ? "Modo claro" : "Modo oscuro"}
      >
          <span className="flex transition-transform duration-500" style={{ transform: dark ? "rotate(180deg)" : "rotate(0deg)" }}>
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium text-text hover:bg-gray/10 transition-colors cursor-pointer w-full"
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      <span className="inline-block transition-transform duration-500" style={{ transform: dark ? "rotate(180deg)" : "rotate(0deg)" }}>
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </span>
      {dark ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
