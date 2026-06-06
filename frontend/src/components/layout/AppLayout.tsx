import { useMemo } from "react";
import { useLocation, Outlet } from "react-router-dom";
import AuthGuard from "./AuthGuard";
import SidebarNav from "./SidebarNav";
import BottomNav from "./BottomNav";
import MobileDrawer from "./MobileDrawer";

const pageMeta: Record<string, { title: string; subtitle?: string }> = {
  "/": { title: "Inicio" },
  "/asistente": { title: "Asistente de Salud", subtitle: "Orientación basada en tu perfil de salud" },
  "/historial": { title: "Mi Historial" },
  "/servicios": { title: "Servicios Cercanos" },
  "/eventos": { title: "Eventos" },
  "/alertas": { title: "Alertas" },
  "/recordatorios": { title: "Recordatorios" },
};

export default function AppLayout() {
  const { pathname } = useLocation();

  const meta = useMemo(() => {
    const exact = pageMeta[pathname];
    if (exact) return exact;
    for (const [path, m] of Object.entries(pageMeta)) {
      if (path !== "/" && pathname.startsWith(path)) return m;
    }
    return { title: "Pulso" };
  }, [pathname]);

  return (
    <AuthGuard>
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-surface border-r border-gray/20 z-40">
        <SidebarNav />
      </aside>

      <div className="md:ml-64 h-screen flex flex-col">
        <header className="bg-surface border-b border-gray/20 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center gap-3 md:hidden z-30">
          <MobileDrawer />
          <div className="min-w-0">
            <h1 className="font-semibold text-text text-sm truncate">{meta.title}</h1>
            {meta.subtitle && <p className="text-xs text-gray truncate">{meta.subtitle}</p>}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div key={pathname} className="animate-fade-in-up h-full">
            <Outlet />
          </div>
        </main>

        <nav className="bg-surface border-t border-gray/20 z-20 pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Navegación principal">
          <BottomNav />
        </nav>
      </div>
    </AuthGuard>
  );
}
