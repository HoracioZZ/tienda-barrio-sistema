import { useState, useEffect } from "react";
import {
  registrarPedido,
  listarPedidos,
  listarProveedores,
} from "../modules/compras/pedidoService";
import { getUsuarioActual } from "../modules/auth/authService";
import SidebarCompras from "../components/SidebarCompras";

function Pedidos() {
  const [proveedores, setProveedores] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [idProveedor, setIdProveedor] = useState("");
  const [idProducto, setIdProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const usuario = getUsuarioActual();
  const iniciales = usuario?.nombre
    ? usuario.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "AD";

  async function cargarDatos() {
    try {
      const [prov, ped] = await Promise.all([listarProveedores(), listarPedidos()]);
      setProveedores(prov);
      setPedidos(ped);
    } catch (err) {
      setError("No se pudieron cargar los datos.");
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setExito("");

    if (!idProveedor || !idProducto || !cantidad) {
      setError("Completa todos los campos.");
      return;
    }

    setCargando(true);
    try {
      await registrarPedido({
        id_proveedor: Number(idProveedor),
        items: [{ id_producto: Number(idProducto), cantidad_pedida: Number(cantidad) }],
      });
      setExito("Pedido registrado correctamente.");
      setIdProducto("");
      setCantidad("");
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar el pedido.");
    } finally {
      setCargando(false);
    }
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    const texto = busqueda.toLowerCase();
    return (
      p.proveedor?.nombre?.toLowerCase().includes(texto) ||
      String(p.id_pedido).includes(texto) ||
      p.estado?.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarCompras />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-stone/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <h1 className="font-display text-2xl font-bold text-primary">
              Pedidos a Proveedores
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {pedidos.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {pedidos.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                {iniciales}
              </div>
              <span className="text-ink text-sm font-sans">{usuario?.nombre || "Admin"}</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Fila superior: formulario + tarjeta ilustrativa */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5 space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </span>
                <h2 className="font-display font-semibold text-ink">Nuevo pedido</h2>
              </div>

              <div>
                <label className="block text-sm text-stone mb-1">Proveedor</label>
                <select
                  value={idProveedor}
                  onChange={(e) => setIdProveedor(e.target.value)}
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Selecciona un proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id_proveedor} value={p.id_proveedor}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-stone mb-1">ID de producto</label>
                  <input
                    type="number"
                    placeholder="Ingresa el ID del producto"
                    value={idProducto}
                    onChange={(e) => setIdProducto(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">Cantidad</label>
                  <input
                    type="number"
                    placeholder="Ingresa la cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {error && <p className="text-danger text-sm">{error}</p>}
              {exito && <p className="text-success text-sm">{exito}</p>}

              <button
                type="submit"
                disabled={cargando}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {cargando ? "Guardando..." : "Registrar pedido"}
              </button>
            </form>

            <div className="bg-primary/5 rounded-lg p-5 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <p className="font-display font-semibold text-primary mb-1">Gestiona tus pedidos</p>
              <p className="text-stone text-sm font-sans">
                Registra y consulta los pedidos realizados a tus proveedores de forma rápida y organizada.
              </p>
            </div>
          </div>

          {/* Tabla de pedidos */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone/10">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z" />
                    <rect x="4" y="4" width="16" height="18" rx="2" />
                  </svg>
                </span>
                <h2 className="font-display font-semibold text-ink">Pedidos registrados</h2>
              </div>
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar pedido..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-stone/20 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-3 text-sm font-sans">#</th>
                  <th className="p-3 text-sm font-sans">Fecha</th>
                  <th className="p-3 text-sm font-sans">Proveedor</th>
                  <th className="p-3 text-sm font-sans">Estado</th>
                  <th className="p-3 text-sm font-sans">Productos</th>
                  <th className="p-3 text-sm font-sans">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((p) => (
                  <tr key={p.id_pedido} className="border-t border-stone/10">
                    <td className="p-3 text-ink text-sm">{p.id_pedido}</td>
                    <td className="p-3 text-ink text-sm">{new Date(p.fecha).toLocaleDateString()}</td>
                    <td className="p-3 text-ink text-sm">{p.proveedor?.nombre}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-xs font-semibold px-2 py-1 rounded-full">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {p.estado}
                      </span>
                    </td>
                    <td className="p-3 text-ink text-sm">
                      {p.detalles?.map((d) => (
                        <div key={d.id_detalle_pedido}>
                          {d.producto?.nombre} x{d.cantidad_pedida}
                        </div>
                      ))}
                    </td>
                    <td className="p-3">
                      <button className="text-stone hover:text-ink p-1">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-stone text-xs font-sans mt-6">
            © 2026 PedidosPro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pedidos;