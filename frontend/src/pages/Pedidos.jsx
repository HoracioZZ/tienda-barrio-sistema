import { useState, useEffect } from "react";
import {
  registrarPedido,
  listarPedidos,
  listarProveedores,
  registrarProveedor,
  listarProductos,
  cambiarEstadoPedido,
} from "../modules/compras/pedidoService";
import SidebarCompras from "../components/SidebarCompras";
import HeaderModulo from "../components/HeaderModulo";

function Pedidos() {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  const [idProveedor, setIdProveedor] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [idProductoSeleccionado, setIdProductoSeleccionado] = useState("");
  const [mostrarListaProductos, setMostrarListaProductos] = useState(false);
  const [cantidad, setCantidad] = useState("");

  const [busquedaFecha, setBusquedaFecha] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
  const [nuevoProvNombre, setNuevoProvNombre] = useState("");
  const [nuevoProvContacto, setNuevoProvContacto] = useState("");
  const [errorProveedor, setErrorProveedor] = useState("");

  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  async function cargarDatos() {
    try {
      const [prov, prod, ped] = await Promise.all([
        listarProveedores(),
        listarProductos(),
        listarPedidos(),
      ]);
      setProveedores(prov);
      setProductos(prod);
      setPedidos(ped);
    } catch (err) {
      setError("No se pudieron cargar los datos.");
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const productoSeleccionado = productos.find(
    (p) => p.id_producto === Number(idProductoSeleccionado)
  );

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  function seleccionarProducto(p) {
    setIdProductoSeleccionado(p.id_producto);
    setBusquedaProducto(p.nombre);
    setMostrarListaProductos(false);
  }

  const totalEstimadoNuevo =
    productoSeleccionado && cantidad
      ? Number(productoSeleccionado.precio_compra) * Number(cantidad)
      : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setExito("");

    if (!idProveedor || !idProductoSeleccionado || !cantidad) {
      setError("Completa todos los campos.");
      return;
    }

    setCargando(true);
    try {
      await registrarPedido({
        id_proveedor: Number(idProveedor),
        items: [
          { id_producto: Number(idProductoSeleccionado), cantidad_pedida: Number(cantidad) },
        ],
      });
      setExito("Pedido registrado correctamente.");
      setBusquedaProducto("");
      setIdProductoSeleccionado("");
      setCantidad("");
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar el pedido.");
    } finally {
      setCargando(false);
    }
  }

  async function handleCrearProveedor(e) {
    e.preventDefault();
    setErrorProveedor("");
    if (!nuevoProvNombre.trim()) {
      setErrorProveedor("El nombre es obligatorio.");
      return;
    }
    try {
      await registrarProveedor({ nombre: nuevoProvNombre, contacto: nuevoProvContacto });
      setModalProveedorAbierto(false);
      setNuevoProvNombre("");
      setNuevoProvContacto("");
      cargarDatos();
    } catch (err) {
      setErrorProveedor(err.response?.data?.error || "Error al registrar el proveedor.");
    }
  }

  async function handleCambiarEstado(id_pedido, estado) {
    try {
      await cambiarEstadoPedido(id_pedido, estado);
      setMenuAbiertoId(null);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar el estado.");
    }
  }

function fechaLocalISO(fecha) {
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const pedidosFiltrados = pedidos.filter((p) => {
  if (!busquedaFecha) return true;
  return fechaLocalISO(p.fecha) === busquedaFecha;
});

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarCompras />
      <div className="flex-1 flex flex-col">
        <HeaderModulo
          titulo="Pedidos a Proveedores"
          notificaciones={pedidos.filter((p) => p.estado === "Pendiente")}
        />

        <div className="p-6">
          {/* Fila superior: formulario + tarjeta */}
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
                <div className="relative">
                  <label className="block text-sm text-stone mb-1">Producto</label>
                  <input
                    type="text"
                    placeholder="Busca un producto por nombre"
                    value={busquedaProducto}
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value);
                      setIdProductoSeleccionado("");
                      setMostrarListaProductos(true);
                    }}
                    onFocus={() => setMostrarListaProductos(true)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {mostrarListaProductos && busquedaProducto && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-stone/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {productosFiltrados.length === 0 ? (
                        <p className="px-3 py-2 text-stone text-sm font-sans">Sin resultados.</p>
                      ) : (
                        productosFiltrados.map((p) => (
                          <button
                            type="button"
                            key={p.id_producto}
                            onClick={() => seleccionarProducto(p)}
                            className="w-full text-left px-3 py-2 hover:bg-cream text-sm text-ink font-sans flex justify-between"
                          >
                            <span>{p.nombre}</span>
                            <span className="font-mono text-stone">Bs {p.precio_compra}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
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

              {productoSeleccionado && cantidad > 0 && (
                <p className="text-sm text-stone font-sans">
                  Precio unitario:{" "}
                  <span className="font-mono text-ink">Bs {productoSeleccionado.precio_compra}</span>{" "}
                  — Total estimado:{" "}
                  <span className="font-mono text-primary font-semibold">
                    Bs {totalEstimadoNuevo.toFixed(2)}
                  </span>
                </p>
              )}

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
              <p className="text-stone text-sm font-sans mb-4">
                Registra y consulta los pedidos realizados a tus proveedores de forma rápida y organizada.
              </p>
              <button
                onClick={() => setModalProveedorAbierto(true)}
                className="flex items-center gap-2 bg-white border border-primary text-primary font-semibold rounded-lg px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Registrar proveedor
              </button>
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
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  type="date"
                  value={busquedaFecha}
                  onChange={(e) => setBusquedaFecha(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-stone/20 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {busquedaFecha && (
                  <button
                    onClick={() => setBusquedaFecha("")}
                    className="ml-2 text-stone text-xs hover:text-danger"
                  >
                    Limpiar
                  </button>
                )}
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
                  <th className="p-3 text-sm font-sans">Total</th>
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
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                          p.estado === "Recibido"
                            ? "bg-success/15 text-success"
                            : p.estado === "Cancelado"
                            ? "bg-danger/15 text-danger"
                            : "bg-accent/15 text-accent"
                        }`}
                      >
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
                    <td className="p-3 font-mono text-primary text-sm font-semibold">
                      Bs {Number(p.total_estimado || 0).toFixed(2)}
                    </td>
                    <td className="p-3 relative">
                      <button
                        onClick={() => setMenuAbiertoId(menuAbiertoId === p.id_pedido ? null : p.id_pedido)}
                        className="text-stone hover:text-ink p-1"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                      {menuAbiertoId === p.id_pedido && (
                        <div className="absolute right-0 mt-1 w-40 bg-white border border-stone/20 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleCambiarEstado(p.id_pedido, "Recibido")}
                            className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-cream font-sans"
                          >
                            Marcar Recibido
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(p.id_pedido, "Cancelado")}
                            className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-cream font-sans"
                          >
                            Cancelar pedido
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(p.id_pedido, "Pendiente")}
                            className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-cream font-sans"
                          >
                            Marcar Pendiente
                          </button>
                        </div>
                      )}
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

      {/* Modal registrar proveedor */}
      {modalProveedorAbierto && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="font-display font-semibold text-ink mb-4">Registrar proveedor</h3>
            <form onSubmit={handleCrearProveedor} className="space-y-3">
              <div>
                <label className="block text-sm text-stone mb-1">Nombre</label>
                <input
                  type="text"
                  value={nuevoProvNombre}
                  onChange={(e) => setNuevoProvNombre(e.target.value)}
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-sm text-stone mb-1">Contacto</label>
                <input
                  type="text"
                  value={nuevoProvContacto}
                  onChange={(e) => setNuevoProvContacto(e.target.value)}
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              {errorProveedor && <p className="text-danger text-sm">{errorProveedor}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalProveedorAbierto(false);
                    setErrorProveedor("");
                  }}
                  className="px-4 py-2 rounded-lg text-stone font-sans text-sm hover:bg-cream"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pedidos;