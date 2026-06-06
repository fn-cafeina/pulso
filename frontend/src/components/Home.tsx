import { useAuth } from "../lib/auth";
import {
  Stethoscope,
  ClipboardList,
  MapPin,
  Bell,
  Calendar,
  AlertTriangle,
} from "lucide-react";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-card shadow-sm p-6 border border-gray/10 animate-pulse">
      <div className="w-8 h-8 bg-gray/20 rounded-button mb-3" />
      <div className="h-4 bg-gray/20 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray/10 rounded w-full" />
    </div>
  );
}

function SkeletonHome() {
  return (
    <div>
      <div className="h-8 bg-gray/20 rounded w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { username, rol, isAuthenticated, hydrated } = useAuth();

  if (!hydrated) return <SkeletonHome />;
  if (!isAuthenticated) return null;

  return (
    <div className="py-4 md:py-6 px-4 md:px-8">
      <h2 className="text-2xl font-bold text-text mb-6">
        Bienvenido, {username}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          href="/asistente"
          className="bg-white rounded-card shadow-sm p-6 hover:shadow-md transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <Stethoscope className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Consultar al asistente</h3>
          <p className="text-sm text-gray">Orientación sobre síntomas y salud</p>
        </a>

        <a
          href="/historial"
          className="bg-white rounded-card shadow-sm p-6 hover:shadow-md transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <ClipboardList className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Mi historial</h3>
          <p className="text-sm text-gray">Síntomas, vacunas y citas</p>
        </a>

        <a
          href="/servicios"
          className="bg-white rounded-card shadow-sm p-6 hover:shadow-md transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <MapPin className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Servicios cercanos</h3>
          <p className="text-sm text-gray">Centros de salud cerca de ti</p>
        </a>

        <a
          href="/recordatorios"
          className="bg-white rounded-card shadow-sm p-6 hover:shadow-md transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <Bell className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Recordatorios</h3>
          <p className="text-sm text-gray">Citas y vacunas pendientes</p>
        </a>

        <a
          href="/eventos"
          className="bg-white rounded-card shadow-sm p-6 hover:shadow-md transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <Calendar className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Eventos de salud</h3>
          <p className="text-sm text-gray">Jornadas y campañas</p>
        </a>

        <a
          href="/alertas"
          className="bg-white rounded-card shadow-sm p-6 hover:shadow-md transition-all border border-gray/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
        >
          <AlertTriangle className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text mb-1">Alertas</h3>
          <p className="text-sm text-gray">Alertas epidemiológicas</p>
        </a>
      </div>

      {rol === "health_worker" && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-text mb-4">Panel de trabajador de salud</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/servicios"
              className="bg-primary/5 rounded-card shadow-sm p-6 hover:shadow-md transition-all border border-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
            >
              <MapPin className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-semibold text-primary mb-1">Gestionar servicios</h4>
              <p className="text-sm text-gray">Crear, editar y eliminar centros</p>
            </a>
            <a
              href="/eventos"
              className="bg-primary/5 rounded-card shadow-sm p-6 hover:shadow-md transition-all border border-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
            >
              <Calendar className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-semibold text-primary mb-1">Gestionar eventos</h4>
              <p className="text-sm text-gray">Jornadas, campañas y ferias</p>
            </a>
            <a
              href="/alertas"
              className="bg-primary/5 rounded-card shadow-sm p-6 hover:shadow-md transition-all border border-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]"
            >
              <AlertTriangle className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-semibold text-primary mb-1">Gestionar alertas</h4>
              <p className="text-sm text-gray">Crear y desactivar alertas</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
