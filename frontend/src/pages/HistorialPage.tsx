import { useEffect, useRef } from "react";
import { Stethoscope, Syringe, CalendarDays } from "lucide-react";
import { useSymptomsStore } from "../stores/symptoms";
import { useVaccinesStore } from "../stores/vaccines";
import { useAppointmentsStore } from "../stores/appointments";
import ResourceSection from "../components/historial/ResourceSection";
import CreateSymptomForm from "../components/historial/CreateSymptomForm";
import CreateVaccineForm from "../components/historial/CreateVaccineForm";
import CreateAppointmentForm from "../components/historial/CreateAppointmentForm";
import type { SymptomReport, VaccinationRecord, Appointment } from "../types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SymptomCard(s: SymptomReport) {
  return (
    <div className="bg-surface rounded-card p-5 transition-all animate-fade-in-up">
      <p className="text-text text-sm leading-relaxed">{s.descripcion}</p>
      <p className="text-xs text-gray mt-2">{formatDate(s.fecha)}</p>
    </div>
  );
}

function VaccineCard(v: VaccinationRecord) {
  return (
    <div className="bg-surface rounded-card p-5 transition-all animate-fade-in-up">
      <p className="text-text font-semibold">{v.nombre_vacuna}</p>
      <p className="text-xs text-gray mt-1">{formatDate(v.fecha_aplicacion)}</p>
    </div>
  );
}

function AppointmentCard(a: Appointment) {
  return (
    <div className="bg-surface rounded-card p-5 transition-all animate-fade-in-up">
      <p className="text-text text-sm leading-relaxed">{a.descripcion}</p>
      <p className="text-xs text-gray mt-2">{formatDateTime(a.fecha)}</p>
    </div>
  );
}

export default function HistorialPage() {
  const sym = useSymptomsStore();
  const vac = useVaccinesStore();
  const appt = useAppointmentsStore();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      sym.fetch();
      vac.fetch();
      appt.fetch();
    }
  }, []);

  return (
    <div className="py-4 md:py-6 px-4 md:px-8 space-y-10">
      <ResourceSection
        title="Síntomas"
        icon={<Stethoscope className="w-5 h-5" />}
        items={sym.items}
        loading={sym.loading}
        error={sym.error}
        emptyTitle="No hay síntomas registrados"
        emptyDescription="Registrá tus síntomas para llevar un control de tu salud."
        createLabel="Nuevo síntoma"
        onRefresh={() => sym.fetch()}
        onClearError={sym.clearError}
        renderCard={(item) => <SymptomCard {...(item as SymptomReport)} />}
        renderCreateForm={({ onSuccess, onCancel }) => (
          <CreateSymptomForm onCreate={sym.add} onSuccess={onSuccess} onCancel={onCancel} />
        )}
      />

      <ResourceSection
        title="Vacunas"
        icon={<Syringe className="w-5 h-5" />}
        items={vac.items}
        loading={vac.loading}
        error={vac.error}
        emptyTitle="No hay vacunas registradas"
        emptyDescription="Registrá tus vacunas para mantener tu historial al día."
        createLabel="Nueva vacuna"
        onRefresh={() => vac.fetch()}
        onClearError={vac.clearError}
        renderCard={(item) => <VaccineCard {...(item as VaccinationRecord)} />}
        renderCreateForm={({ onSuccess, onCancel }) => (
          <CreateVaccineForm onCreate={vac.add} onSuccess={onSuccess} onCancel={onCancel} />
        )}
      />

      <ResourceSection
        title="Citas"
        icon={<CalendarDays className="w-5 h-5" />}
        items={appt.items}
        loading={appt.loading}
        error={appt.error}
        emptyTitle="No hay citas agendadas"
        emptyDescription="Agendá tus citas médicas para recibir recordatorios."
        createLabel="Nueva cita"
        onRefresh={() => appt.fetch()}
        onClearError={appt.clearError}
        renderCard={(item) => <AppointmentCard {...(item as Appointment)} />}
        renderCreateForm={({ onSuccess, onCancel }) => (
          <CreateAppointmentForm onCreate={appt.add} onSuccess={onSuccess} onCancel={onCancel} />
        )}
      />
    </div>
  );
}
