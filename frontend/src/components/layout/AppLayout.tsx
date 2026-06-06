import { useLocation, Outlet } from "react-router-dom";
import AuthGuard from "./AuthGuard";
import SidebarNav from "./SidebarNav";
import BottomNav from "./BottomNav";
import MobileDrawer from "./MobileDrawer";

export default function AppLayout() {
  const { pathname } = useLocation();

  return (
    <AuthGuard>
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-surface border-r border-gray/20 z-40">
        <SidebarNav />
      </aside>

      <div className="md:ml-64 h-screen flex flex-col">
        <header className="bg-surface border-b border-gray/20 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center justify-between md:hidden z-30">
          <MobileDrawer />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div key={pathname} className="animate-fade-in-up">
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
