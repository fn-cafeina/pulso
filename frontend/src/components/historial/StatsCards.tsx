import { Stethoscope, Syringe, CalendarDays } from "lucide-react";

interface StatsCardsProps {
  symptomsCount: number
  vaccinesCount: number
  appointmentsCount: number
}

export default function StatsCards({ symptomsCount, vaccinesCount, appointmentsCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
      <div className="bg-surface rounded-card p-3 sm:p-4 flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-5 h-5 text-info" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-text">{symptomsCount}</p>
          <p className="text-xs text-gray truncate">Síntomas</p>
        </div>
      </div>
      <div className="bg-surface rounded-card p-3 sm:p-4 flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
          <Syringe className="w-5 h-5 text-success" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-text">{vaccinesCount}</p>
          <p className="text-xs text-gray truncate">Vacunas</p>
        </div>
      </div>
      <div className="bg-surface rounded-card p-3 sm:p-4 flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-text">{appointmentsCount}</p>
          <p className="text-xs text-gray truncate">Citas</p>
        </div>
      </div>
    </div>
  );
}
