import { getUsuarioActual, logout } from "../modules/auth/authService";
import { useNavigate } from "react-router-dom";
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

          <div className="mt-6 inline-block bg-white rounded-lg shadow-sm p-4">
            <p className="text-stone text-sm font-sans">Ventas de hoy</p>
            <p className="font-mono text-2xl text-primary font-semibold">Bs 0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}