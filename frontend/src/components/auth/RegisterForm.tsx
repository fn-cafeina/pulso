import { useState, useRef, useEffect } from "react";
import { register } from "../../lib/api";
import { User, Lock, Eye, EyeOff, Loader2, ChevronDown } from "lucide-react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [antecedentes, setAntecedentes] = useState("");
  const [codigo, setCodigo] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
    setError("");
    setFieldErrors({});

    const usernameErr = username.trim().length < 3 ? "Mínimo 3 caracteres" : "";
    const passwordErr = password.length < 6 ? "Mínimo 6 caracteres" : "";

    if (usernameErr || passwordErr) {
      setFieldErrors({ username: usernameErr || undefined, password: passwordErr || undefined });
      return;
    }

    setLoading(true);

    try {
      await register({
        username: username.trim(),
        password,
        antecedentes_medicos: antecedentes.trim() || undefined,
        codigo: codigo.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm animate-shake" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3 text-sm" role="status">
          Cuenta creada correctamente. Redirigiendo al inicio de sesión...
        </div>
      )}

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
            aria-describedby={fieldErrors.username ? "reg-username-error" : undefined}
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearFieldError("username"); setError(""); }}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-white text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
              fieldErrors.username
                ? "border-danger focus:ring-danger/50 focus:border-danger"
                : "border-gray/30"
            }`}
            placeholder="Elige un usuario"
          />
        </div>
        {fieldErrors.username && (
          <p id="reg-username-error" className="text-danger text-xs mt-1" role="alert">{fieldErrors.username}</p>
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
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "reg-password-error" : undefined}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); setError(""); }}
            className={`w-full pl-10 pr-12 py-3 rounded-lg border bg-white text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
              fieldErrors.password
                ? "border-danger focus:ring-danger/50 focus:border-danger"
                : "border-gray/30"
            }`}
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-gray hover:text-text transition-colors cursor-pointer rounded-md"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p id="reg-password-error" className="text-danger text-xs mt-1" role="alert">{fieldErrors.password}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowOptional(!showOptional)}
        aria-expanded={showOptional}
        className="flex items-center gap-1 py-2 px-1 text-sm text-primary hover:text-primary-dark font-medium transition-colors cursor-pointer"
      >
        Opciones avanzadas
        <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? "rotate-180" : ""}`} />
      </button>

      {showOptional && (
        <div className="space-y-4 border-t border-gray/20 pt-4">
          <div>
            <label htmlFor="antecedentes" className="block text-sm font-medium text-text mb-1">
              Antecedentes médicos
            </label>
            <textarea
              id="antecedentes"
              name="antecedentes"
              value={antecedentes}
              onChange={(e) => setAntecedentes(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-lg border border-gray/30 bg-white text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
              placeholder="Ej: Asma leve, alergia a la penicilina..."
            />
          </div>

          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-text mb-1">
              Código de trabajador de salud
            </label>
            <input
              id="codigo"
              name="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray/30 bg-white text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              placeholder="Opcional"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success}
        className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          "Crear Cuenta"
        )}
      </button>

      <p className="text-center text-sm text-gray">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
