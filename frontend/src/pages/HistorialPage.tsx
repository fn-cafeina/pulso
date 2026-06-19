import { useEffect, useRef, useState, useMemo } from "react";
import { ClipboardList, Stethoscope, Syringe, CalendarDays, Plus } from "lucide-react";
import { useSymptomsStore } from "../stores/symptoms";
import { useVaccinesStore } from "../stores/vaccines";
import { useAppointmentsStore } from "../stores/appointments";
import { useDelayedLoading } from "../lib/useDelayedLoading";
import Modal from "../components/ui/Modal";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";
import AlertBanner from "../components/ui/AlertBanner";
import CreateSymptomForm from "../components/historial/CreateSymptomForm";
import CreateVaccineForm from "../components/historial/CreateVaccineForm";
import CreateAppointmentForm from "../components/historial/CreateAppointmentForm";
import type { SymptomReport, VaccinationRecord, Appointment } from "../types";

type Tab = "todos" | "sintomas" | "vacunas" | "citas";
type CreateTab = "sintoma" | "vacuna" | "cita";

const tabs: { key: Tab; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "sintomas", label: "Síntomas" },
  { key: "vacunas", label: "Vacunas" },
  { key: "citas", label: "Citas" },
];

const createTabs: { key: CreateTab; label: string; icon: React.ReactNode }[] = [
  { key: "sintoma", label: "Síntoma", icon: <Stethoscope className="w-4 h-4" /> },
  { key: "vacuna", label: "Vacuna", icon: <Syringe className="w-4 h-4" /> },
  { key: "cita", label: "Cita", icon: <CalendarDays className="w-4 h-4" /> },
];

const tabToCreate: Record<Tab, CreateTab> = {
  todos: "sintoma",
  sintomas: "sintoma",
  vacunas: "vacuna",
  citas: "cita",
};

const typeBadge: Record<CreateTab, string> = {
  sintoma: "bg-info/10 text-info",
  vacuna: "bg-success/10 text-success",
  cita: "bg-primary/10 text-primary",
};

const typeIcon: Record<CreateTab, React.ReactNode> = {
  sintoma: <Stethoscope className="w-3.5 h-3.5" />,
  vacuna: <Syringe className="w-3.5 h-3.5" />,
  cita: <CalendarDays className="w-3.5 h-3.5" />,
};

const typeLabel: Record<CreateTab, string> = {
  sintoma: "Síntoma",
  vacuna: "Vacuna",
  cita: "Cita",
};

interface DetailData {
  type: CreateTab
  raw: SymptomReport | VaccinationRecord | Appointment
}

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

interface HistoryCardItem {
  id: number
  type: CreateTab
  title: string
  date: string
  raw: SymptomReport | VaccinationRecord | Appointment
}

function HistoryCard({ item, onClick }: { item: HistoryCardItem; onClick: () => void }) {
  return (
    <div
      className="bg-surface rounded-card p-6 transition-all animate-fade-in-up cursor-pointer hover:ring-1 hover:ring-primary/20"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold ${typeBadge[item.type]}`}>
          {typeIcon[item.type]}
          {typeLabel[item.type]}
        </span>
      </div>
      <p className="text-text text-sm leading-relaxed">{item.title}</p>
      <p className="text-xs text-gray mt-2">{item.date}</p>
    </div>
  );
}

function DetailView({ detail, onClose }: { detail: DetailData; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={`Detalle de ${typeLabel[detail.type].toLowerCase()}`} scrollable>
      <div className="space-y-4">
        <div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold ${typeBadge[detail.type]}`}>
            {typeIcon[detail.type]}
            {typeLabel[detail.type]}
          </span>
        </div>

        {"descripcion" in detail.raw && (
          <div>
            <label className="block text-xs font-medium text-gray mb-1">Descripción</label>
            <p className="text-sm text-text whitespace-pre-wrap">{detail.raw.descripcion || "Sin descripción"}</p>
          </div>
        )}
        {"nombre_vacuna" in detail.raw && (
          <div>
            <label className="block text-xs font-medium text-gray mb-1">Vacuna</label>
            <p className="text-sm text-text font-semibold">{detail.raw.nombre_vacuna}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {detail.type === "vacuna" ? (
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Fecha de aplicación</label>
              <p className="text-sm text-text">{formatDate("fecha_aplicacion" in detail.raw ? detail.raw.fecha_aplicacion : "")}</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Fecha</label>
              <p className="text-sm text-text">{detail.type === "cita" ? formatDateTime((detail.raw as Appointment).fecha) : formatDate((detail.raw as SymptomReport).fecha)}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray mb-1">Registrado</label>
            <p className="text-sm text-text">{formatDate(detail.raw.created_at)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray mb-1">Actualizado</label>
            <p className="text-sm text-text">{formatDate(detail.raw.updated_at)}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function HistorialPage() {
  const sym = useSymptomsStore();
  const vac = useVaccinesStore();
  const appt = useAppointmentsStore();
  const [tab, setTab] = useState<Tab>("todos");
  const [showCreate, setShowCreate] = useState(false);
  const [createTab, setCreateTab] = useState<CreateTab>("sintoma");
  const [detail, setDetail] = useState<DetailData | null>(null);
  const initialLoad = useRef(true);

  const loading = sym.loading || vac.loading || appt.loading;
  const error = sym.error || vac.error || appt.error;
  const hasItems = sym.items.length > 0 || vac.items.length > 0 || appt.items.length > 0;
  const loadingInitial = loading && !hasItems;
  const showSkeleton = useDelayedLoading(loadingInitial);
  const errorInitial = error && !hasItems && !loading;

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      sym.fetch();
      vac.fetch();
      appt.fetch();
    }
  }, []);

  function handleRefresh() {
    sym.fetch();
    vac.fetch();
    appt.fetch();
  }

  function handleFabClick() {
    setCreateTab(tabToCreate[tab]);
    setShowCreate(true);
  }

  function handleDetail(type: CreateTab, raw: SymptomReport | VaccinationRecord | Appointment) {
    setDetail({ type, raw });
  }

  const items = useMemo(() => {
    switch (tab) {
      case "sintomas":
        return sym.items.map((s) => ({
          id: s.id,
          type: "sintoma" as CreateTab,
          title: s.descripcion,
          date: formatDate(s.fecha || s.created_at),
          raw: s,
        }));
      case "vacunas":
        return vac.items.map((v) => ({
          id: v.id,
          type: "vacuna" as CreateTab,
          title: v.nombre_vacuna,
          date: formatDate(v.fecha_aplicacion || v.created_at),
          raw: v,
        }));
      case "citas":
        return appt.items.map((a) => ({
          id: a.id,
          type: "cita" as CreateTab,
          title: a.descripcion,
          date: formatDateTime(a.fecha),
          raw: a,
        }));
      default: {
        const all: HistoryCardItem[] = [
          ...sym.items.map((s) => ({ id: s.id, type: "sintoma" as CreateTab, title: s.descripcion, date: s.fecha || s.created_at, raw: s })),
          ...vac.items.map((v) => ({ id: v.id, type: "vacuna" as CreateTab, title: v.nombre_vacuna, date: v.fecha_aplicacion || v.created_at, raw: v })),
          ...appt.items.map((a) => ({ id: a.id, type: "cita" as CreateTab, title: a.descripcion, date: a.fecha, raw: a })),
        ];
        all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return all.map((item) => ({
          ...item,
          date: item.type === "cita" ? formatDateTime(item.date) : formatDate(item.date),
        }));
      }
    }
  }, [tab, sym.items, vac.items, appt.items]);

  const empty = !loading && items.length === 0;

  const emptyConfig: Record<Tab, { title: string; description: string }> = {
    todos: { title: "No hay registros", description: "Agregá síntomas, vacunas o citas para ver tu historial médico." },
    sintomas: { title: "No hay síntomas registrados", description: "Registrá tus síntomas para llevar un control de tu salud." },
    vacunas: { title: "No hay vacunas registradas", description: "Registrá tus vacunas para mantener tu historial al día." },
    citas: { title: "No hay citas agendadas", description: "Agendá tus citas médicas para recibir recordatorios." },
  };

  const partialError = error && hasItems && !loading;

  return (
    <div className="py-4 md:py-6 px-4 md:px-8">
      {showSkeleton && (
        <div className="space-y-4">
          <div className="h-8 bg-gray/20 rounded w-48 animate-pulse-gentle" />
          <div className="flex gap-1 bg-gray/10 rounded-button p-1 w-fit animate-pulse-gentle">
            <div className="h-8 w-16 bg-gray/20 rounded-button" />
            <div className="h-8 w-20 bg-gray/20 rounded-button" />
            <div className="h-8 w-20 bg-gray/20 rounded-button" />
            <div className="h-8 w-16 bg-gray/20 rounded-button" />
          </div>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {errorInitial && (
        <>
          <AlertBanner message={error} onClose={() => { sym.clearError(); vac.clearError(); appt.clearError(); }} />
          <button
            onClick={handleRefresh}
            className="mt-4 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-button transition-all cursor-pointer"
          >
            Reintentar
          </button>
        </>
      )}

      {!showSkeleton && (
        <>
          <h2 className="hidden md:block text-lg font-bold text-text mb-4">Mi Historial</h2>

          <div className="flex gap-1 mb-6 bg-gray/10 rounded-button p-1 w-fit">
            {tabs.map((t) => {
              const count = t.key === "todos"
                ? sym.items.length + vac.items.length + appt.items.length
                : t.key === "sintomas" ? sym.items.length
                : t.key === "vacunas" ? vac.items.length
                : appt.items.length;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center px-4 py-1.5 rounded-button text-sm font-medium transition-all cursor-pointer ${
                    tab === t.key ? "bg-surface text-text shadow-xs" : "text-gray hover:text-text"
                  }`}
                >
                  {t.label}
                  {count > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold bg-primary/20 text-primary rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {partialError && (
            <div className="mb-4">
              <AlertBanner message={error} onClose={() => { sym.clearError(); vac.clearError(); appt.clearError(); }} onRetry={handleRefresh} />
            </div>
          )}

          {empty && !errorInitial && (
            <EmptyState
              icon={<ClipboardList className="w-5 h-5 text-primary" />}
              title={emptyConfig[tab].title}
              description={emptyConfig[tab].description}
            />
          )}

          {items.length > 0 && (
            <div className="space-y-3">
              {items.map((item) => (
                <HistoryCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  onClick={() => handleDetail(item.type, item.raw)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {detail && <DetailView detail={detail} onClose={() => setDetail(null)} />}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo registro"
        size="sm"
      >
        <div className="flex gap-1 mb-5 bg-gray/10 rounded-button p-1 w-fit">
          {createTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setCreateTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-button text-sm font-medium transition-all cursor-pointer ${
                createTab === t.key ? "bg-surface text-text shadow-xs" : "text-gray hover:text-text"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {createTab === "sintoma" && (
          <CreateSymptomForm
            onCreate={sym.add}
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        )}
        {createTab === "vacuna" && (
          <CreateVaccineForm
            onCreate={vac.add}
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        )}
        {createTab === "cita" && (
          <CreateAppointmentForm
            onCreate={appt.add}
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </Modal>

      {!showSkeleton && !errorInitial && (
        <button
          onClick={handleFabClick}
          className="fixed bottom-24 md:bottom-6 right-4 z-40 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Nuevo registro"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
