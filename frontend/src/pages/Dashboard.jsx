import { getUsuarioActual, logout } from "../modules/auth/authService";
import { useNavigate, Link } from "react-router-dom";
import SidebarCompras from "../components/SidebarCompras";
import HeaderModulo from "../components/HeaderModulo";

export default function Dashboard() {
  const usuario = getUsuarioActual();

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarCompras />
      <div className="flex-1">
        <HeaderModulo titulo={`Bienvenida, ${usuario?.nombre || ""}`} />

        <div className="p-6">
          <p className="text-stone font-sans">
            Panel principal — cada módulo (Ventas, Inventario, Clientes, Compras, Reportes)
            se irá agregando aquí como ruta propia por cada integrante del equipo.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="inline-block bg-white rounded-lg shadow-sm p-4">
              <p className="text-stone text-sm font-sans">Ventas de hoy</p>
              <p className="font-mono text-2xl text-primary font-semibold">Bs 0.00</p>
            </div>

            {usuario?.rol === "Administrador" && (
              <Link
                to="/productos"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg px-5 py-4 shadow-sm transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41 12 22l-8.59-8.59a2 2 0 0 1 0-2.82L11 3h9v9l-.41.41z" />
                  <circle cx="7.5" cy="7.5" r="1.5" />
                </svg>
                Ir a Productos y Catálogo
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}