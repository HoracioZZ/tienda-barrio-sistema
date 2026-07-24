import { useState, useRef, useEffect } from "react";
import { getUsuarioActual } from "../modules/auth/authService";

export default function HeaderModulo({ titulo, notificaciones = null }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const usuario = getUsuarioActual();
  const iniciales = usuario?.nombre
    ? usuario.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "AD";

  useEffect(() => {
    function handleClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const mostrarCampana = notificaciones !== null;

  return (
    <header className="bg-white border-b border-stone/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <h1 className="font-display text-2xl font-bold text-primary">{titulo}</h1>
      </div>

      <div className="flex items-center gap-5">
        {mostrarCampana && (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setAbierto((v) => !v)}
              className="relative"
              aria-label="Notificaciones"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notificaciones.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notificaciones.length}
                </span>
              )}
            </button>

            {abierto && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-stone/10 z-10">
                <div className="px-4 py-2 border-b border-stone/10">
                  <p className="font-display font-semibold text-ink text-sm">Pedidos pendientes</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notificaciones.length === 0 ? (
                    <p className="px-4 py-3 text-stone text-sm font-sans">No hay pedidos pendientes.</p>
                  ) : (
                    notificaciones.map((n) => (
                      <div key={n.id_pedido} className="px-4 py-2 border-b border-stone/5 last:border-0">
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
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
            {iniciales}
          </div>
          <span className="text-ink text-sm font-sans">{usuario?.nombre || "Admin"}</span>
        </div>
      </div>
    </header>
  );
}