import { useState, useRef, useEffect } from "react";
import { login } from "../../lib/api";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const clearFieldError = (name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name as keyof typeof prev]) return prev;
      return { ...prev, [name]: undefined };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    setLoading(true);

    try {
      await login(username.trim(), password);
      window.location.href = "/";
    } catch (err: any) {
      const msg = err.message;
      if (msg === "usuario no encontrado") {
        setFieldErrors({ username: "Usuario no encontrado" });
      } else if (msg === "contraseña incorrecta") {
        setFieldErrors({ password: "Contraseña incorrecta" });
      } else {
        setFieldErrors({ username: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-text mb-1">
          Usuario
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" aria-hidden="true" />
          <input
            ref={usernameRef}
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            autoComplete="username"
            aria-invalid={!!fieldErrors.username}
            aria-describedby={fieldErrors.username ? "username-error" : undefined}
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearFieldError("username"); }}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
              fieldErrors.username
                ? "border-danger focus:ring-danger/50 focus:border-danger"
                : "border-gray/30"
            }`}
            placeholder="Tu usuario"
          />
        </div>
        {fieldErrors.username && (
          <p id="username-error" className="text-danger text-xs mt-1" role="alert">{fieldErrors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" aria-hidden="true" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete="current-password"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
            className={`w-full pl-10 pr-12 py-2.5 rounded-lg border bg-white text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
              fieldErrors.password
                ? "border-danger focus:ring-danger/50 focus:border-danger"
                : "border-gray/30"
            }`}
            placeholder="Tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray hover:text-text transition-colors cursor-pointer rounded-md"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p id="password-error" className="text-danger text-xs mt-1" role="alert">{fieldErrors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </button>

      <p className="text-center text-sm text-gray">
        ¿No tienes cuenta?{" "}
        <a href="/register" className="text-primary hover:text-primary-dark font-medium transition-colors">
          Regístrate
        </a>
      </p>
    </form>
  );
}
