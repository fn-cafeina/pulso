import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import { sidebarItems, isActive } from "./navConfig";
import ThemeToggle from "./ThemeToggle";

export default function MobileDrawer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { username } = useAuthStore();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleNavClick = () => {
    setDrawerOpen(false);
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
                const active = isActive(location.pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={handleNavClick}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-3 rounded-button text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-text hover:bg-gray/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-gray/20 p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {username?.charAt(0).toUpperCase()}
                </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">{username}</p>
          </div>
                <ThemeToggle compact />
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray hover:text-danger hover:bg-danger/5 rounded-button transition-colors cursor-pointer"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
