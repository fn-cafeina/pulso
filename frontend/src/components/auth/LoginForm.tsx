import { useState, useRef, useEffect } from "react";
import { login } from "../../lib/api";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
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
          placeholder="Tu usuario"
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
          placeholder="Tu contraseña"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
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
