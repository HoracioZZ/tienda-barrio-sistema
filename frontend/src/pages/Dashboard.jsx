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
          <p className="text-stone font-sans mb-6">
            Panel principal — accede a los módulos del sistema desde aquí.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/ventas"
              className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow w-48"
            >
              <p className="font-display font-semibold text-primary text-lg mb-1">Ventas</p>
              <p className="text-stone text-sm font-sans">Registrar ventas y ver historial</p>
            </Link>

            {usuario?.rol === "Administrador" && (
              <Link
                to="/pedidos"
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow w-48"
              >
                <p className="font-display font-semibold text-primary text-lg mb-1">Pedidos</p>
                <p className="text-stone text-sm font-sans">Pedidos a proveedores</p>
              </Link>
            )}

            {usuario?.rol === "Administrador" && (
              <Link
                to="/productos"
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow w-48"
              >
                <p className="font-display font-semibold text-primary text-lg mb-1">Productos</p>
                <p className="text-stone text-sm font-sans">Catálogo e inventario</p>
              </Link>
            )}

            {/* Cada integrante agrega aqui su propia tarjeta cuando termine, ej: */}
            {/* <Link to="/inventario" ...>Inventario</Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}