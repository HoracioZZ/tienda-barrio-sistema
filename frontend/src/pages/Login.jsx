import { useState } from "react";
import { login } from "../modules/auth/authService";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [loginInput, setLoginInput] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(loginInput, contrasena);
      navigate("/dashboard");
    } catch {
      setError("Usuario o contraseña incorrectos");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-80 space-y-4">
        <h1 className="font-display font-extrabold text-2xl text-center text-primary">
          Tienda de Barrio
        </h1>
        <input
          className="w-full border border-stone/30 p-2 rounded font-sans text-ink focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Usuario"
          value={loginInput}
          onChange={(e) => setLoginInput(e.target.value)}
        />
        <input
          className="w-full border border-stone/30 p-2 rounded font-sans text-ink focus:outline-none focus:ring-2 focus:ring-primary"
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />
        {error && <p className="text-danger text-sm font-sans">{error}</p>}
        <button className="w-full bg-primary text-white p-2 rounded font-sans font-semibold hover:bg-primary-dark transition-colors">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
