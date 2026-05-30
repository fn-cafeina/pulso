import { useEffect, useState } from "react";
import { isAuthenticated } from "../../lib/api";
import { Loader2 } from "lucide-react";

export default function AuthGuard() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    setChecking(false);
  }, []);

  if (!checking) return null;

  return (
    <div className="fixed inset-0 bg-neutral flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-gray">Verificando sesión...</p>
      </div>
    </div>
  );
}
