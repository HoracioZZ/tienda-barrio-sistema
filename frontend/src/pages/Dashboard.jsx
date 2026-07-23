import { getUsuarioActual, logout } from "../modules/auth/authService";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const usuario = getUsuarioActual();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-extrabold text-2xl text-primary">
          Bienvenida, {usuario?.nombre}
        </h1>
        <button onClick={handleLogout} className="text-sm text-danger font-sans hover:underline">
          Cerrar sesión
        </button>
      </div>
      <p className="text-stone font-sans">
        Panel principal — cada módulo (Ventas, Inventario, Clientes, Compras, Reportes)
        se irá agregando aquí como ruta propia por cada integrante del equipo.
      </p>

      {/* Ejemplo de uso de la tipografia monoespaciada para montos, ej. resumen del dia */}
      <div className="mt-6 inline-block bg-white rounded-lg shadow-sm p-4">
        <p className="text-stone text-sm font-sans">Ventas de hoy</p>
        <p className="font-mono text-2xl text-primary font-semibold">Bs 0.00</p>
      </div>
    </div>
  );
}
