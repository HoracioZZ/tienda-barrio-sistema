// components/SidebarClientes.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../modules/auth/authService";

const iconos = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  ventas: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  pedidos: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  clientes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

export default function SidebarClientes() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside className="w-60 min-h-screen bg-primary p-4 flex flex-col">
      <div className="mb-8 px-2">
        <p className="font-display font-extrabold text-white text-lg">
          Tiendita
        </p>
        <p className="text-cream/70 text-xs font-sans">Gestión de clientes</p>
      </div>

      <nav className="flex-1">
        <ItemMenu to="/dashboard" icono={iconos.dashboard} label="Dashboard" />
        <ItemMenu to="/ventas" icono={iconos.ventas} label="Ventas" />
        <ItemMenu to="/pedidos" icono={iconos.pedidos} label="Pedidos" />
        <ItemMenu to="/clientes" icono={iconos.clientes} label="Clientes" />
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