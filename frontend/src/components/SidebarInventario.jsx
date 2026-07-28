import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, getUsuarioActual } from "../modules/auth/authService";
import { useSidebar } from "../context/SidebarContext";

const iconos = {
  dashboard: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  ventas: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  pedidos: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  productos: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.59 13.41 12 22l-8.59-8.59a2 2 0 0 1 0-2.82L11 3h9v9l-.41.41z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  ),
  clientes: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  reportes: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  ),
  salir: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

function ItemMenu({ to, icono, label }) {
  const location = useLocation();
  const activo = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-sm mb-1 transition-colors ${
        activo
          ? "bg-primary text-white font-semibold"
          : "text-cream/90 hover:bg-primary-dark"
      }`}
    >
      {icono}
      {label}
    </Link>
  );
}

export default function SidebarInventario() {
  const { isOpen, setIsOpen } = useSidebar();
  const navigate = useNavigate();
  const usuario = getUsuarioActual();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      {/* Overlay para móvil */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`
          w-60 min-h-screen bg-primary p-4 flex flex-col
          fixed lg:static inset-y-0 left-0 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="mb-8 px-2">
          <p className="font-display font-extrabold text-white text-lg">
            Tiendita
          </p>
          <p className="text-cream/70 text-xs font-sans">
            Inventario y Catálogo
          </p>
        </div>

        <nav className="flex-1">
          <ItemMenu
            to="/dashboard"
            icono={iconos.dashboard}
            label="Dashboard"
          />
          <ItemMenu to="/ventas" icono={iconos.ventas} label="Ventas" />
          {usuario?.rol === "Administrador" && (
            <ItemMenu to="/pedidos" icono={iconos.pedidos} label="Pedidos" />
          )}
          <ItemMenu
            to="/productos"
            icono={iconos.productos}
            label="Productos"
          />
          {(usuario?.rol === "Administrador" ||
            usuario?.rol === "Vendedor") && (
            <ItemMenu to="/clientes" icono={iconos.clientes} label="Clientes" />
          )}
          {usuario?.rol === "Administrador" && (
            <ItemMenu to="/reportes" icono={iconos.reportes} label="Reportes" />
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-cream/90 font-sans text-sm hover:bg-primary-dark transition-colors"
        >
          {iconos.salir}
          Cerrar sesión
        </button>
      </aside>
    </>
  );
}
