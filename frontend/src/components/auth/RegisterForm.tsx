import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, login } from "../../lib/api";
import { useAuthStore } from "../../stores/auth";
import { User, Lock, Eye, EyeOff, Loader2, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [antecedentes, setAntecedentes] = useState("");
  const [codigo, setCodigo] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string; confirmPassword?: string }>({});
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

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

    const errors: { username?: string; password?: string; confirmPassword?: string } = {};
    if (username.trim().length < 3) errors.username = "Mínimo 3 caracteres";
    if (password.length < 6) errors.password = "Mínimo 6 caracteres";
    if (password !== confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const user = username.trim();

    try {
      await register({ username: user, password, antecedentes_medicos: antecedentes.trim() || undefined, codigo: codigo.trim() || undefined });
      await login(user, password);
      setSuccess(true);
      setTimeout(() => navigate("/"), 600);
    } catch (err: any) {
      const msg = err.message;
      if (msg.includes("ya está en uso")) {
        setFieldErrors({ username: msg });
      } else {
        setError(msg);
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const btnClass = `w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold py-2.5 rounded-button shadow hover:shadow-md active:shadow-sm transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]`;
  const inputClass = (hasError: boolean) =>
    `w-full pl-10 pr-12 py-3 rounded-button border bg-surface text-text placeholder:text-gray focus:outline-none focus:ring-2 transition-all duration-200 ${
      hasError
        ? "border-danger focus:ring-danger/50 focus:border-danger"
        : "border-gray/30 focus:ring-primary/50 focus:border-primary"
    }`;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 animate-fade-in-up">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-lg font-semibold text-text mb-1">Cuenta creada</h3>
        <p className="text-sm text-gray">Bienvenido a Pulso. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 text-danger rounded-button px-4 py-3 text-sm animate-shake" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-text mb-1">
          Usuario
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" aria-hidden="true" />
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
            className={inputClass(!!fieldErrors.username)}
            placeholder="Tu usuario"
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
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" aria-hidden="true" />
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
            className={`${inputClass(!!fieldErrors.password)} pr-12`}
            placeholder="Tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-gray hover:text-text transition-colors cursor-pointer rounded-md"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p id="reg-password-error" className="text-danger text-xs mt-1" role="alert">{fieldErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1">
          Confirmar contraseña
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword || showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.confirmPassword}
            aria-describedby={fieldErrors.confirmPassword ? "reg-confirm-error" : undefined}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); setError(""); }}
            className={`w-full px-4 py-3 rounded-button border bg-surface text-text placeholder:text-gray focus:outline-none focus:ring-2 transition-all duration-200 pr-12 ${
              fieldErrors.confirmPassword
                ? "border-danger focus:ring-danger/50 focus:border-danger"
                : "border-gray/30 focus:ring-primary/50 focus:border-primary"
            }`}
            placeholder="Repite la contraseña"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-gray hover:text-text transition-colors cursor-pointer rounded-md"
            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p id="reg-confirm-error" className="text-danger text-xs mt-1" role="alert">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          aria-expanded={showOptional}
          className="flex items-center gap-1 py-2 px-1 text-sm text-primary hover:text-primary-dark font-medium transition-colors cursor-pointer"
        >
          Opciones avanzadas
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showOptional ? "rotate-180" : ""}`} />
        </button>

        {showOptional && (
          <div className="space-y-4 border-t border-gray/20 pt-4 mt-2">
            <div>
              <label htmlFor="antecedentes" className="block text-sm font-medium text-text mb-1">
                Antecedentes médicos
              </label>
              <div>
                <textarea
                  id="antecedentes"
                  name="antecedentes"
                  value={antecedentes}
                  onChange={(e) => setAntecedentes(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2.5 rounded-button border border-gray/30 bg-surface text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                  placeholder="Ej: Asma leve, alergia a la penicilina..."
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray">{antecedentes.length}/500</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-text mb-1">
                Código de trabajador de salud{" "}
                <span className="text-gray font-normal">(opcional)</span>
              </label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-button border border-gray/30 bg-surface text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Si eres personal de salud, ingresa tu código"
              />
            </div>
          </div>
        )}
      </div>

      <button type="submit" disabled={loading || success} className={btnClass}>
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
        <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
