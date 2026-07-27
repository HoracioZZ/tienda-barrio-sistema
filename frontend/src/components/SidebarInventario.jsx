import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, getUsuarioActual } from "../modules/auth/authService";

const iconos = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  productos: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41 12 22l-8.59-8.59a2 2 0 0 1 0-2.82L11 3h9v9l-.41.41z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  ),
  pedidos: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  salir: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        activo ? "bg-primary text-white font-semibold" : "text-cream/90 hover:bg-primary-dark"
      }`}
    >
      {icono}
      {label}
    </Link>
  );
}

export default function SidebarInventario() {
  const navigate = useNavigate();
  const usuario = getUsuarioActual();
  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside className="w-60 min-h-screen bg-primary p-4 flex flex-col">
      <div className="mb-8 px-2">
        <p className="font-display font-extrabold text-white text-lg">Tiendita </p>
        <p className="text-cream/70 text-xs font-sans">Inventario y Catálogo</p>
      </div>
      <nav className="flex-1">
        <ItemMenu to="/dashboard" icono={iconos.dashboard} label="Dashboard" />
        {usuario?.rol === "Administrador" && (
          <ItemMenu to="/pedidos" icono={iconos.pedidos} label="Pedidos" />
        )}
        <ItemMenu to="/productos" icono={iconos.productos} label="Productos" />
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-cream/90 font-sans text-sm hover:bg-primary-dark transition-colors"
      >
        {iconos.salir}
        Cerrar sesión
      </button>
    </aside>
  );
}