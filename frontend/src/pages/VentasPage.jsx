import { useState, useEffect, useRef } from "react";
import {
  buscarProductos,
  registrarVenta,
  listarVentas,
} from "../modules/ventas/ventaService";
import SidebarVentas from "../components/SidebarVentas";
import HeaderModulo from "../components/HeaderModulo";
import api from '../services/api';

function VentasPage() {
  const [tab, setTab] = useState("pos");

  // ---- Estado del POS ----
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const debounceRef = useRef(null);

  // ---- Estado para Cliente en POS ----
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [mostrarSelectorCliente, setMostrarSelectorCliente] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const selectorRef = useRef(null); // Para cerrar al hacer clic fuera

  // ---- Estado del Historial ----
  const [ventas, setVentas] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [errorHistorial, setErrorHistorial] = useState("");

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  // Cerrar selector al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setMostrarSelectorCliente(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar clientes por código, nombre o teléfono
  useEffect(() => {
    const q = busquedaCliente.trim().toLowerCase();
    if (!q) {
      setClientesFiltrados(clientes);
      return;
    }
    const filtrados = clientes.filter(c => 
      String(c.id_cliente).toLowerCase().includes(q) ||
      (c.nombre || "").toLowerCase().includes(q) ||
      (c.telefono || "").toLowerCase().includes(q)
    );
    setClientesFiltrados(filtrados);
  }, [busquedaCliente, clientes]);

  async function cargarClientes() {
    setCargandoClientes(true);
    try {
      const res = await api.get("/clientes");
      if (Array.isArray(res.data)) {
        // Solo clientes activos y ordenados por nombre
        const activos = res.data
          .filter(c => c.estado !== false)
          .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
        setClientes(activos);
        setClientesFiltrados(activos);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setCargandoClientes(false);
    }
  }

  // RF-4: busqueda en tiempo real con debounce (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length === 0) {
      setResultados([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await buscarProductos(query.trim());
        setResultados(data);
      } catch (err) {
        setError("Error al buscar productos");
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Cargar historial cuando se entra a esa pestaña
  useEffect(() => {
    if (tab === "historial") {
      cargarHistorial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function cargarHistorial() {
    setCargandoHistorial(true);
    setErrorHistorial("");
    try {
      const data = await listarVentas({ desde: desde || undefined, hasta: hasta || undefined });
      setVentas(data);
    } catch (err) {
      setErrorHistorial("Error al cargar el historial de ventas");
    } finally {
      setCargandoHistorial(false);
    }
  }

  function agregarAlCarrito(producto) {
    setError("");
    setCarrito((prev) => {
      const existente = prev.find((it) => it.id_producto === producto.id_producto);
      if (existente) {
        return prev.map((it) =>
          it.id_producto === producto.id_producto
            ? { ...it, cantidad: it.cantidad + 1 }
            : it
        );
      }
      return [
        ...prev,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio_venta: Number(producto.precio_venta),
          stock: producto.stock,
          cantidad: 1,
        },
      ];
    });
    setQuery("");
    setResultados([]);
  }

  function actualizarCantidad(id_producto, cantidad) {
    const cantidadNum = Math.max(1, Number(cantidad) || 1);
    setCarrito((prev) =>
      prev.map((it) =>
        it.id_producto === id_producto ? { ...it, cantidad: cantidadNum } : it
      )
    );
  }

  function quitarDelCarrito(id_producto) {
    setCarrito((prev) => prev.filter((it) => it.id_producto !== id_producto));
  }

  const total = carrito.reduce(
    (acc, it) => acc + it.precio_venta * it.cantidad,
    0
  );

  async function confirmarVenta() {
    setError("");
    setExito("");
    if (carrito.length === 0) {
      setError("Agrega al menos un producto antes de registrar la venta");
      return;
    }

    setRegistrando(true);
    try {
      const payload = {
        items: carrito.map((it) => ({
          id_producto: it.id_producto,
          cantidad: it.cantidad,
        })),
      };
      
      if (clienteSeleccionado) {
        payload.id_cliente = clienteSeleccionado.id_cliente;
      }
      
      const venta = await registrarVenta(payload);
      
      const mensajeCliente = clienteSeleccionado 
        ? ` con cliente ${clienteSeleccionado.nombre} (se sumaron puntos)` 
        : " (venta libre)";
      
      setExito(`Venta #${venta.id_venta} registrada correctamente${mensajeCliente}`);
      setCarrito([]);
      setClienteSeleccionado(null);
      setBusquedaCliente("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar la venta");
    } finally {
      setRegistrando(false);
    }
  }

  function seleccionarCliente(cliente) {
    setClienteSeleccionado(cliente);
    setMostrarSelectorCliente(false);
    setBusquedaCliente("");
  }

  function quitarCliente() {
    setClienteSeleccionado(null);
    setMostrarSelectorCliente(false);
    setBusquedaCliente("");
  }

  // Resaltar coincidencias en la búsqueda
  function resaltarTexto(texto, busqueda) {
    if (!busqueda.trim()) return texto;
    const partes = texto.split(new RegExp(`(${busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return partes.map((parte, i) => 
      parte.toLowerCase() === busqueda.toLowerCase() 
        ? <span key={i} className="bg-yellow-200 font-medium">{parte}</span>
        : parte
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarVentas />
      <div className="flex-1">
        <HeaderModulo titulo="Punto de Venta" />
        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-stone/20">
            <button
              onClick={() => setTab("pos")}
              className={`px-4 py-2 font-display font-semibold ${
                tab === "pos"
                  ? "text-primary border-b-2 border-primary"
                  : "text-stone"
              }`}
            >
              Registrar Venta
            </button>
            <button
              onClick={() => setTab("historial")}
              className={`px-4 py-2 font-display font-semibold ${
                tab === "historial"
                  ? "text-primary border-b-2 border-primary"
                  : "text-stone"
              }`}
            >
              Historial
            </button>
          </div>

          {tab === "pos" && (
            <>
              {/* Selector de Cliente */}
              <div className="bg-white rounded-lg shadow p-4 mb-4" ref={selectorRef}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone">👤 Cliente:</span>
                    {clienteSeleccionado ? (
                      <span className="text-ink font-semibold">
                        {clienteSeleccionado.nombre} 
                        <span className="text-sm text-stone font-normal ml-1">
                          (Cód: {clienteSeleccionado.id_cliente} | Puntos: {clienteSeleccionado.puntos ?? 0})
                        </span>
                      </span>
                    ) : (
                      <span className="text-stone">Venta libre</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {!clienteSeleccionado ? (
                      <button
                        onClick={() => setMostrarSelectorCliente(!mostrarSelectorCliente)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <span>🔍</span>
                        {mostrarSelectorCliente ? "Cerrar" : "Buscar cliente"}
                      </button>
                    ) : (
                      <button
                        onClick={quitarCliente}
                        className="bg-gray-200 hover:bg-gray-300 text-ink px-3 py-1 rounded text-sm"
                      >
                        ✕ Quitar
                      </button>
                    )}
                  </div>
                </div>

                {/* Selector de cliente desplegable */}
                {mostrarSelectorCliente && !clienteSeleccionado && (
                  <div className="mt-3 border-t pt-3">
                    {/* Campo de búsqueda */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="🔍 Buscar por código, nombre o teléfono..."
                        value={busquedaCliente}
                        onChange={(e) => setBusquedaCliente(e.target.value)}
                        className="w-full rounded-lg border border-stone/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        autoFocus
                      />
                      {busquedaCliente && (
                        <button
                          onClick={() => setBusquedaCliente("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {cargandoClientes ? (
                      <div className="text-center py-4 text-stone">
                        <div className="animate-pulse">Cargando clientes...</div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        {/* Mostrar resultados encontrados */}
                        <div className="text-xs text-stone mb-1">
                          {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? 's' : ''} encontrado{clientesFiltrados.length !== 1 ? 's' : ''}
                        </div>

                        {/* Lista con scroll */}
                        <div className="max-h-64 overflow-y-auto border rounded-lg custom-scrollbar">
                          {/* Opción venta libre siempre visible */}
                          <div 
                            className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center gap-2 transition-colors"
                            onClick={quitarCliente}
                          >
                            <span className="text-lg">🛒</span>
                            <span className="font-medium">Venta libre (sin cliente)</span>
                          </div>
                          
                          {clientesFiltrados.length === 0 && busquedaCliente && (
                            <div className="px-4 py-6 text-center text-stone">
                              <p>No se encontraron clientes</p>
                              <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
                            </div>
                          )}
                          
                          {clientesFiltrados.map(cliente => (
                            <div 
                              key={cliente.id_cliente}
                              className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors flex items-center justify-between"
                              onClick={() => seleccionarCliente(cliente)}
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  {resaltarTexto(cliente.nombre, busquedaCliente)}
                                </div>
                                <div className="text-xs text-stone flex gap-3">
                                  <span>📋 Cód: {cliente.id_cliente}</span>
                                  <span>📱 {cliente.telefono}</span>
                                  <span>⭐ Puntos: {cliente.puntos ?? 0}</span>
                                </div>
                              </div>
                              <span className="text-blue-600 text-sm font-medium ml-2">
                                Seleccionar →
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Indicador de scroll si hay muchos clientes */}
                        {clientesFiltrados.length > 5 && (
                          <div className="text-xs text-stone text-center mt-1">
                            🔽 Usa la rueda del mouse para desplazarte
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Buscador de productos */}
              <div className="relative mb-6">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar producto por nombre..."
                  className="w-full rounded-lg border border-stone/30 px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {buscando && (
                  <span className="absolute right-4 top-3 text-stone text-sm">
                    Buscando...
                  </span>
                )}

                {resultados.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-stone/20 rounded-lg mt-1 shadow-lg max-h-64 overflow-y-auto custom-scrollbar">
                    {resultados.map((producto) => (
                      <li
                        key={producto.id_producto}
                        onClick={() => agregarAlCarrito(producto)}
                        className="flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-cream"
                      >
                        <span className="text-ink">{producto.nombre}</span>
                        <span className="font-mono text-sm text-stone">
                          Bs {Number(producto.precio_venta).toFixed(2)} · Stock:{" "}
                          {producto.stock}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Carrito */}
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <table className="w-full text-left">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Precio unit.</th>
                      <th className="px-4 py-3">Cantidad</th>
                      <th className="px-4 py-3">Subtotal</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-stone">
                          Aún no hay productos en la venta
                        </td>
                      </tr>
                    )}
                    {carrito.map((it) => (
                      <tr key={it.id_producto} className="border-t border-stone/10">
                        <td className="px-4 py-3 text-ink">{it.nombre}</td>
                        <td className="px-4 py-3 font-mono text-ink">
                          Bs {it.precio_venta.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={1}
                            max={it.stock}
                            value={it.cantidad}
                            onChange={(e) =>
                              actualizarCantidad(it.id_producto, e.target.value)
                            }
                            className="w-20 rounded border border-stone/30 px-2 py-1 font-mono"
                          />
                        </td>
                        <td className="px-4 py-3 font-mono text-ink font-semibold">
                          Bs {(it.precio_venta * it.cantidad).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => quitarDelCarrito(it.id_producto)}
                            className="text-danger hover:underline text-sm"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total y confirmar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-lg shadow p-6">
                <div>
                  <p className="font-mono text-2xl text-primary font-semibold">
                    Total: Bs {total.toFixed(2)}
                  </p>
                  {clienteSeleccionado && (
                    <p className="text-sm text-green-600 mt-1">
                      ✅ Cliente: {clienteSeleccionado.nombre} - Se sumarán puntos
                    </p>
                  )}
                </div>
                <button
                  onClick={confirmarVenta}
                  disabled={registrando || carrito.length === 0}
                  className="bg-primary hover:bg-primary-dark text-white font-display font-bold px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  {registrando ? "Registrando..." : "Confirmar Venta"}
                </button>
              </div>

              {error && (
                <p className="mt-4 text-danger bg-danger/10 px-4 py-2 rounded-lg">
                  {error}
                </p>
              )}
              {exito && (
                <p className="mt-4 text-success bg-success/10 px-4 py-2 rounded-lg">
                  {exito}
                </p>
              )}
            </>
          )}

          {tab === "historial" && (
            <>
              {/* Filtro de fechas */}
              <div className="flex flex-wrap items-end gap-4 bg-white rounded-lg shadow p-4 mb-6">
                <div>
                  <label className="block text-sm text-stone mb-1">Desde</label>
                  <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="rounded border border-stone/30 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">Hasta</label>
                  <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="rounded border border-stone/30 px-3 py-2"
                  />
                </div>
                <button
                  onClick={cargarHistorial}
                  className="bg-primary hover:bg-primary-dark text-white font-display font-semibold px-5 py-2 rounded-lg"
                >
                  Filtrar
                </button>
                {(desde || hasta) && (
                  <button
                    onClick={() => {
                      setDesde("");
                      setHasta("");
                      setTimeout(cargarHistorial, 0);
                    }}
                    className="text-stone hover:underline text-sm"
                  >
                    Limpiar filtro
                  </button>
                )}
              </div>

              {/* Tabla de historial */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-4 py-3">#Venta</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Productos</th>
                      <th className="px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargandoHistorial && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-stone">
                          Cargando...
                        </td>
                      </tr>
                    )}
                    {!cargandoHistorial && ventas.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-stone">
                          No hay ventas registradas en este rango
                        </td>
                      </tr>
                    )}
                    {!cargandoHistorial &&
                      ventas.map((venta) => (
                        <tr key={venta.id_venta} className="border-t border-stone/10">
                          <td className="px-4 py-3 text-ink font-mono">
                            #{venta.id_venta}
                          </td>
                          <td className="px-4 py-3 text-ink">
                            {new Date(venta.fecha).toLocaleString("es-BO")}
                          </td>
                          <td className="px-4 py-3 text-ink">
                            {venta.cliente ? venta.cliente.nombre : "Sin cliente"}
                          </td>
                          <td className="px-4 py-3 text-stone text-sm">
                            {venta.detalles.map((d) => (
                              <div key={d.id_detalle}>
                                {d.producto?.nombre ?? `Producto #${d.id_producto}`} × {d.cantidad}
                              </div>
                            ))}
                          </td>
                          <td className="px-4 py-3 font-mono text-ink font-semibold">
                            Bs {Number(venta.total).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {errorHistorial && (
                <p className="mt-4 text-danger bg-danger/10 px-4 py-2 rounded-lg">
                  {errorHistorial}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VentasPage;