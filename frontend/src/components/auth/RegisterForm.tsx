import { useState, useRef, useEffect } from "react";
import { register } from "../../lib/api";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [antecedentes, setAntecedentes] = useState("");
  const [codigo, setCodigo] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3 text-sm">
          Cuenta creada correctamente. Redirigiendo al inicio de sesión...
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-text mb-1">
          Usuario
        </label>
        <input
          ref={usernameRef}
          id="username"
          type="text"
          required
          minLength={3}
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(""); }}
          className="w-full px-4 py-2.5 rounded-lg border border-gray/30 bg-white text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          placeholder="Elige un usuario"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          className="w-full px-4 py-2.5 rounded-lg border border-gray/30 bg-white text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowOptional(!showOptional)}
        className="text-sm text-primary hover:text-primary-dark font-medium transition-colors cursor-pointer"
      >
        {showOptional ? "Ocultar opciones avanzadas" : "Opciones avanzadas"}
      </button>

      {showOptional && (
        <div className="space-y-4 border-t border-gray/20 pt-4">
          <div>
            <label htmlFor="antecedentes" className="block text-sm font-medium text-text mb-1">
              Antecedentes médicos
            </label>
            <textarea
              id="antecedentes"
              value={antecedentes}
              onChange={(e) => setAntecedentes(e.target.value)}
              rows={3}
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
        className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? "Creando cuenta..." : "Crear Cuenta"}
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
