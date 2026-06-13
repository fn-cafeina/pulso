import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import {
  Stethoscope,
  ClipboardList,
  MapPin,
  Bell,
  Calendar,
  AlertTriangle,
} from "lucide-react";

export default function Home() {
  const { username, rol, isAuthenticated, hydrated } = useAuthStore();

  if (!hydrated) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="py-4 md:py-6 px-4 md:px-8">
      <h2 className="text-2xl font-bold text-text mb-6">
        Bienvenido, {username}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/asistente"
          className="animate-fade-in-up bg-surface rounded-card shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <Stethoscope className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Consultar al asistente</h3>
          <p className="text-sm text-gray">Orientación sobre síntomas y salud</p>
        </Link>

        <Link
          to="/historial"
          className="animate-fade-in-up bg-surface rounded-card shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <ClipboardList className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Mi historial</h3>
          <p className="text-sm text-gray">Síntomas, vacunas y citas</p>
        </Link>

        <Link
          to="/servicios"
          className="animate-fade-in-up bg-surface rounded-card shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <MapPin className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Servicios cercanos</h3>
          <p className="text-sm text-gray">Centros de salud cerca de ti</p>
        </Link>

        <Link
          to="/recordatorios"
          className="animate-fade-in-up bg-surface rounded-card shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <Bell className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Recordatorios</h3>
          <p className="text-sm text-gray">Citas y vacunas pendientes</p>
        </Link>

        <Link
          to="/eventos"
          className="animate-fade-in-up bg-surface rounded-card shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <Calendar className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Eventos de salud</h3>
          <p className="text-sm text-gray">Jornadas y campañas</p>
        </Link>

        <Link
          to="/alertas"
          className="animate-fade-in-up bg-surface rounded-card shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <AlertTriangle className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Alertas</h3>
          <p className="text-sm text-gray">Alertas epidemiológicas</p>
        </Link>
      </div>

      {rol === "health_worker" && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-text mb-4">Panel de trabajador de salud</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/servicios"
              className="animate-fade-in-up bg-primary/5 rounded-card shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all border border-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
            >
              <MapPin className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-semibold text-primary mb-1">Gestionar servicios</h4>
              <p className="text-sm text-gray">Crear, editar y eliminar centros</p>
            </Link>
            <Link
              to="/eventos"
              className="animate-fade-in-up bg-primary/5 rounded-card shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all border border-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
            >
              <Calendar className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-semibold text-primary mb-1">Gestionar eventos</h4>
              <p className="text-sm text-gray">Jornadas, campañas y ferias</p>
            </Link>
            <Link
              to="/alertas"
              className="animate-fade-in-up bg-primary/5 rounded-card shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all border border-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
            >
              <AlertTriangle className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-semibold text-primary mb-1">Gestionar alertas</h4>
              <p className="text-sm text-gray">Crear y desactivar alertas</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
