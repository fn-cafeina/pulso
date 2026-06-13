import { Outlet } from "react-router-dom";

export default function AuthLayout() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-neutral to-info/5 flex items-center justify-center px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Pulso</h1>
          <p className="text-gray mt-1">Su asistente de monitoreo de salud</p>
        </div>

        <div className="bg-surface rounded-card shadow-lg border border-gray/10 p-6 sm:p-8">
          <div className="animate-fade-in-up">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}
