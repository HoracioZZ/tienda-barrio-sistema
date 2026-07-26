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
  proveedores: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
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
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-sm mb-1 transition-all duration-200 ${
        activo
          ? "bg-white/20 text-white font-semibold shadow-lg"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      <span className={activo ? "text-white" : "text-white/60"}>{icono}</span>
      {label}
    </Link>
  );
}

export default function SidebarClientes() {
  const navigate = useNavigate();

  function handleLogout() {
    if (confirm("¿Estás seguro de cerrar sesión?")) {
      logout();
      navigate("/");
    }
  }

  return (
    <aside className="w-64 min-h-screen bg-primary p-4 flex flex-col shadow-2xl">
      {/* Logo / Título */}
      <div className="mb-8 px-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <p className="font-display font-extrabold text-white text-xl tracking-tight">
              Clientes
            </p>
            <p className="text-cream/50 text-xs font-sans">Gestión de clientes</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-0.5 mt-4">
        <ItemMenu to="/dashboard" icono={iconos.dashboard} label="Dashboard" />
        <ItemMenu to="/ventas" icono={iconos.ventas} label="Ventas" />
        <ItemMenu to="/pedidos" icono={iconos.pedidos} label="Pedidos" />
        <ItemMenu to="/clientes" icono={iconos.clientes} label="Clientes" />
        <ItemMenu to="/proveedores" icono={iconos.proveedores} label="Proveedores" />
      </nav>

      {/* Footer con información del usuario */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="px-3 py-2 mb-3 bg-white/5 rounded-lg">
          <p className="text-white/80 text-xs font-medium">👤 Usuario</p>
          <p className="text-cream/40 text-xs">admin@horacio.com</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-cream/70 font-sans text-sm hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
        >
          {iconos.salir}
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}