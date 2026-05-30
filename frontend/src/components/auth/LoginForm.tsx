import { useState, useRef, useEffect } from "react";
import { login } from "../../lib/api";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({});
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const validateField = (name: string, value: string) => {
    if (name === "username" && value.trim().length < 3) {
      return "Mínimo 3 caracteres";
    }
    if (name === "password" && value.length < 6) {
      return "Mínimo 6 caracteres";
    }
    return "";
  };

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleChange = (name: string, value: string) => {
    if (name === "username") setUsername(value);
    if (name === "password") setPassword(value);
    setError("");
    if (touched[name as keyof typeof touched]) {
      const err = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const usernameErr = validateField("username", username);
    const passwordErr = validateField("password", password);
    setFieldErrors({ username: usernameErr, password: passwordErr });
    setTouched({ username: true, password: true });

    if (usernameErr || passwordErr) return;

    setLoading(true);

    try {
      await login(username.trim(), password);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm animate-shake">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-text mb-1">
          Usuario
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
          <input
            ref={usernameRef}
            id="username"
            type="text"
            required
            minLength={3}
            value={username}
            onChange={(e) => handleChange("username", e.target.value)}
            onBlur={(e) => handleBlur("username", e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
              touched.username && fieldErrors.username
                ? "border-danger focus:ring-danger/50 focus:border-danger"
                : "border-gray/30"
            }`}
            placeholder="Tu usuario"
          />
        </div>
        {touched.username && fieldErrors.username && (
          <p className="text-danger text-xs mt-1">{fieldErrors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={(e) => handleBlur("password", e.target.value)}
            className={`w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
              touched.password && fieldErrors.password
                ? "border-danger focus:ring-danger/50 focus:border-danger"
                : "border-gray/30"
            }`}
            placeholder="Tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-text transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {touched.password && fieldErrors.password && (
          <p className="text-danger text-xs mt-1">{fieldErrors.password}</p>
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
