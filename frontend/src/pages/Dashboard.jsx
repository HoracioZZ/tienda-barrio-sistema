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
            {/* Ventas - Todos */}
            <Link
              to="/ventas"
              className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow w-48"
            >
              <p className="font-display font-semibold text-primary text-lg mb-1">Ventas</p>
              <p className="text-stone text-sm font-sans">Registrar ventas y ver historial</p>
            </Link>

            {/* Clientes - Admin y Vendedor */}
            {(usuario?.rol === "Administrador" || usuario?.rol === "Vendedor") && (
              <Link
                to="/clientes"
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow w-48"
              >
                <p className="font-display font-semibold text-primary text-lg mb-1">Clientes</p>
                <p className="text-stone text-sm font-sans">Gestionar clientes y puntos</p>
              </Link>
            )}

            {/* Productos - Solo Admin */}
            {usuario?.rol === "Administrador" && (
              <Link
                to="/productos"
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow w-48"
              >
                <p className="font-display font-semibold text-primary text-lg mb-1">Productos</p>
                <p className="text-stone text-sm font-sans">Catálogo e inventario</p>
              </Link>
            )}

            {/* Pedidos - Solo Admin */}
            {usuario?.rol === "Administrador" && (
              <Link
                to="/pedidos"
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow w-48"
              >
                <p className="font-display font-semibold text-primary text-lg mb-1">Pedidos</p>
                <p className="text-stone text-sm font-sans">Pedidos a proveedores</p>
              </Link>
            )}

            {/* Compras - Solo Admin */}
            {usuario?.rol === "Administrador" && (
              <Link
                to="/compras"
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow w-48"
              >
                <p className="font-display font-semibold text-primary text-lg mb-1">Compras</p>
                <p className="text-stone text-sm font-sans">Gestión de compras</p>
              </Link>
            )}

            {/* Reportes - Solo Admin */}
            {usuario?.rol === "Administrador" && (
              <Link
                to="/reportes"
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow w-48"
              >
                <p className="font-display font-semibold text-primary text-lg mb-1">Reportes</p>
                <p className="text-stone text-sm font-sans">Ver reportes y estadísticas</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}