import { useEffect, useState } from "react";
import { isAuthenticated, getUsername, getRole, clearAuth } from "../lib/api";
import {
  HeartPulse,
  Stethoscope,
  ClipboardList,
  MapPin,
  Bell,
  Calendar,
  AlertTriangle,
  LogOut,
} from "lucide-react";

export default function Home() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [rol, setRol] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    setUsername(getUsername() || "");
    setRol(getRole() || "");
    setAuthorized(true);
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <p className="text-gray">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">Pulso</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray">
              Hola, <span className="font-medium text-text">{username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-danger hover:text-danger/80 font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-text mb-6">
          Bienvenido, {username}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="#"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray/10"
          >
            <Stethoscope className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-text mb-1">Consultar al asistente</h3>
            <p className="text-sm text-gray">Orientación sobre síntomas y salud</p>
          </a>

          <a
            href="#"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray/10"
          >
            <ClipboardList className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-text mb-1">Mi historial</h3>
            <p className="text-sm text-gray">Síntomas, vacunas y citas</p>
          </a>

          <a
            href="#"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray/10"
          >
            <MapPin className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-text mb-1">Servicios cercanos</h3>
            <p className="text-sm text-gray">Centros de salud cerca de ti</p>
          </a>

          <a
            href="#"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray/10"
          >
            <Bell className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-text mb-1">Recordatorios</h3>
            <p className="text-sm text-gray">Citas y vacunas pendientes</p>
          </a>

          <a
            href="#"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray/10"
          >
            <Calendar className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-text mb-1">Eventos de salud</h3>
            <p className="text-sm text-gray">Jornadas y campañas</p>
          </a>

          <a
            href="#"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray/10"
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
                href="#"
                className="bg-primary/5 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-primary/20"
              >
                <MapPin className="w-6 h-6 text-primary mb-2" />
                <h4 className="font-semibold text-primary mb-1">Gestionar servicios</h4>
                <p className="text-sm text-gray">Crear, editar y eliminar centros</p>
              </a>
              <a
                href="#"
                className="bg-primary/5 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-primary/20"
              >
                <Calendar className="w-6 h-6 text-primary mb-2" />
                <h4 className="font-semibold text-primary mb-1">Gestionar eventos</h4>
                <p className="text-sm text-gray">Jornadas, campañas y ferias</p>
              </a>
              <a
                href="#"
                className="bg-primary/5 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-primary/20"
              >
                <AlertTriangle className="w-6 h-6 text-primary mb-2" />
                <h4 className="font-semibold text-primary mb-1">Gestionar alertas</h4>
                <p className="text-sm text-gray">Crear y desactivar alertas</p>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
