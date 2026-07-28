import { useState, useRef, useEffect } from "react";
import { getUsuarioActual } from "../modules/auth/authService";
import { Menu, Bell } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

export default function HeaderModulo({
  titulo,
  notificaciones = null,
  sugerenciasStock = [],
}) {
  const { isOpen, setIsOpen } = useSidebar();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const usuario = getUsuarioActual();
  const iniciales = usuario?.nombre
    ? usuario.nombre
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  useEffect(() => {
    function handleClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const mostrarCampana = notificaciones !== null;
  const totalNotificaciones =
    (notificaciones?.length || 0) + sugerenciasStock.length;

  return (
    <header className="bg-white border-b border-stone/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
      {/* Lado izquierdo: hamburguesa + título */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Botón hamburguesa - visible solo en móvil */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-cream transition-colors text-ink"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="font-display text-xl sm:text-2xl font-bold text-primary truncate">
          {titulo}
        </h1>
      </div>

      {/* Lado derecho: notificaciones + usuario */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {mostrarCampana && (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setAbierto((v) => !v)}
              className="relative p-1 hover:bg-cream rounded-lg transition-colors"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5 text-stone" />
              {totalNotificaciones > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalNotificaciones > 9 ? "9+" : totalNotificaciones}
                </span>
              )}
            </button>

            {abierto && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-stone/10 z-50 max-h-[80vh] overflow-y-auto">
                <div className="px-4 py-2 border-b border-stone/10 sticky top-0 bg-white">
                  <p className="font-display font-semibold text-ink text-sm">
                    Pedidos pendientes
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notificaciones.length === 0 ? (
                    <p className="px-4 py-3 text-stone text-sm font-sans">
                      No hay pedidos pendientes.
                    </p>
                  ) : (
                    notificaciones.map((n) => (
                      <div
                        key={n.id_pedido}
                        className="px-4 py-2 border-b border-stone/5 last:border-0"
                      >
                        <p className="text-ink text-sm font-sans">
                          Pedido #{n.id_pedido} — {n.proveedor?.nombre}
                        </p>
                        <p className="text-stone text-xs font-sans">
                          {new Date(n.fecha).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {sugerenciasStock.length > 0 && (
                  <>
                    <div className="px-4 py-2 border-t border-b border-stone/10 bg-cream/50 sticky top-0">
                      <p className="font-display font-semibold text-ink text-sm">
                        Sugerencias de compra (stock bajo)
                      </p>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {sugerenciasStock.map((prod) => (
                        <div
                          key={prod.id_producto}
                          className="px-4 py-2 border-b border-stone/5 last:border-0"
                        >
                          <p className="text-ink text-sm font-sans">
                            {prod.nombre}
                          </p>
                          <p className="text-danger text-xs font-sans">
                            Stock: {prod.stock}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center text-[10px] sm:text-xs font-semibold shrink-0">
            {iniciales}
          </div>
          <span className="text-sm text-ink font-sans hidden sm:block truncate max-w-24">
            {usuario?.nombre || "Admin"}
          </span>
          <span className="text-sm text-ink font-sans sm:hidden truncate max-w-16">
            {usuario?.nombre?.split(" ")[0] || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
