import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { navigate } from "astro:transitions/client";
import { useAuth, clearAuth } from "../../lib/auth";
import { sidebarItems, isActive } from "./navConfig";
import ThemeToggle from "./ThemeToggle";

interface Props {
  currentPath: string;
}

export default function MobileDrawer({ currentPath }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { username } = useAuth();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className="p-2.5 -ml-2 text-text hover:bg-gray/10 rounded-button transition-colors cursor-pointer"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6" />
      </button>

      {drawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-xl flex flex-col animate-fade-in-right">
            <div className="p-5 border-b border-gray/20 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-primary">Pulso</h1>
                <p className="text-xs text-gray mt-0.5">Asistente de salud</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2.5 text-gray hover:text-text hover:bg-gray/10 rounded-button transition-colors cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Menú de navegación">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(currentPath, item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-3 rounded-button text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-text hover:bg-gray/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="p-3 border-t border-gray/20">
              <ThemeToggle />
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-medium text-text truncate">{username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium text-danger hover:bg-danger/5 transition-colors cursor-pointer w-full"
              >
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
