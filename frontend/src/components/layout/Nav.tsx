import { useState } from "react";
import { getUsername, clearAuth } from "../../lib/api";
import {
  Home,
  Stethoscope,
  ClipboardList,
  MapPin,
  Calendar,
  AlertTriangle,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavProps {
  currentPath: string;
  bottomNav?: boolean;
  mobileHeader?: boolean;
}

const sidebarItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/asistente", label: "Asistente IA", icon: Stethoscope },
  { href: "/historial", label: "Mi Historial", icon: ClipboardList },
  { href: "/servicios", label: "Servicios Cercanos", icon: MapPin },
  { href: "/eventos", label: "Eventos", icon: Calendar },
  { href: "/alertas", label: "Alertas", icon: AlertTriangle },
  { href: "/recordatorios", label: "Recordatorios", icon: Bell },
];

const bottomItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/asistente", label: "Asistente", icon: Stethoscope },
  { href: "/servicios", label: "Servicios", icon: MapPin },
  { href: "/historial", label: "Historial", icon: ClipboardList },
];

export default function Nav({ currentPath, bottomNav, mobileHeader }: NavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const username = getUsername();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const isActive = (href: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  };

  if (mobileHeader) {
    return (
      <>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2.5 -ml-2 text-text hover:bg-gray/10 rounded-lg transition-colors cursor-pointer"
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
            <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col animate-fade-in-right">
              <div className="p-5 border-b border-gray/20 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-primary">Pulso</h1>
                  <p className="text-xs text-gray mt-0.5">Asistente de salud</p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2.5 text-gray hover:text-text hover:bg-gray/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Menú de navegación">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
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
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-medium text-text truncate">{username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/5 transition-colors cursor-pointer w-full"
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

  if (bottomNav) {
    return (
      <nav className="flex items-center justify-around h-16" aria-label="Navegación principal">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 min-w-[60px] py-2 transition-colors ${
                active ? "text-primary" : "text-gray"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray/20">
        <h1 className="text-xl font-bold text-primary">Pulso</h1>
        <p className="text-xs text-gray mt-0.5">Asistente de salud</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Menú de navegación">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-text truncate">{username}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/5 transition-colors cursor-pointer w-full"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
