import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { STORAGE_KEY } from "../../lib/theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = next ? "#1a1814" : "#fef9f0";
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium text-text hover:bg-gray/10 transition-colors cursor-pointer w-full"
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      {dark ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
