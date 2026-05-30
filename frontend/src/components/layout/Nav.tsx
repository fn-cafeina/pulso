import { getUsername, clearAuth } from "../../lib/api";
import {
  Home,
  Stethoscope,
  ClipboardList,
  MapPin,
  Calendar,
  AlertTriangle,
  Bell,
  User,
  LogOut,
} from "lucide-react";

interface NavProps {
  currentPath: string;
  bottomNav?: boolean;
  mobileOnly?: boolean;
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
  { href: "/historial", label: "Perfil", icon: User },
];

export default function Nav({ currentPath, bottomNav, mobileOnly }: NavProps) {
  const username = getUsername();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const isActive = (href: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  };

  if (mobileOnly) {
    return (
      <button
        onClick={handleLogout}
        className="text-sm text-danger hover:text-danger/80 font-medium transition-colors cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
      </button>
    );
  }

  if (bottomNav) {
    return (
      <div className="flex items-center justify-around h-16">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-primary" : "text-gray"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray/20">
        <h1 className="text-xl font-bold text-primary">Pulso</h1>
        <p className="text-xs text-gray mt-0.5">Asistente de salud</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
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
