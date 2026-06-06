import { useLocation, useNavigate, Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import { sidebarItems, isActive } from "./navConfig";
import ThemeToggle from "./ThemeToggle";

export default function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useAuthStore();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray/20">
        <h1 className="text-xl font-bold text-primary">Pulso</h1>
        <p className="text-xs text-gray mt-0.5">Asistente de salud</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Menú de navegación">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(location.pathname, item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-text hover:bg-gray/10"
              }`}
            >
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {item.label}
            </Link>
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
  );
}
