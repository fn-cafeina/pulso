import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth";
import AuthLayout from "./components/layout/AuthLayout";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AsistentePage from "./pages/AsistentePage";
import HistorialPage from "./pages/HistorialPage";
import AlertasPage from "./pages/AlertasPage";
import EventosPage from "./pages/EventosPage";
import RecordatoriosPage from "./pages/RecordatoriosPage";
import ServiciosPage from "./pages/ServiciosPage";

export default function App() {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/asistente" element={<AsistentePage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/alertas" element={<AlertasPage />} />
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/recordatorios" element={<RecordatoriosPage />} />
        <Route path="/servicios" element={<ServiciosPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
