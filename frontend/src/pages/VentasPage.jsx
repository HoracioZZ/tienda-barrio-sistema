import { useState, useEffect, useRef } from "react";
import {
  buscarProductos,
  registrarVenta,
  listarVentas,
} from "../modules/ventas/ventaService";
import SidebarVentas from "../components/SidebarVentas";
import HeaderModulo from "../components/HeaderModulo";
import api from "../services/api";
import Footer from "../components/Footer";
import {
  Search,
  User,
  Star,
  Tag,
  ChevronDown,
  X,
  Filter,
  Check,
  ShoppingCart,
  Trash2,
  Calendar,
} from "lucide-react";

function VentasPage() {
  const [tab, setTab] = useState("pos");
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const debounceRef = useRef(null);

  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [mostrarSelectorCliente, setMostrarSelectorCliente] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const selectorRef = useRef(null);

  const [ventas, setVentas] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [errorHistorial, setErrorHistorial] = useState("");

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setMostrarSelectorCliente(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = busquedaCliente.trim().toLowerCase();
    if (!q) {
      setClientesFiltrados(clientes);
      return;
    }
    const filtrados = clientes.filter(
      (c) =>
        String(c.id_cliente).toLowerCase().includes(q) ||
        (c.nombre || "").toLowerCase().includes(q) ||
        (c.telefono || "").toLowerCase().includes(q),
    );
    setClientesFiltrados(filtrados);
  }, [busquedaCliente, clientes]);

  async function cargarClientes() {
    setCargandoClientes(true);
    try {
      const res = await api.get("/clientes");
      if (Array.isArray(res.data)) {
        const activos = res.data
          .filter((c) => c.estado !== false)
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
      const data = await listarVentas({
        desde: desde || undefined,
        hasta: hasta || undefined,
      });
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
      const existente = prev.find(
        (it) => it.id_producto === producto.id_producto,
      );
      if (existente) {
        return prev.map((it) =>
          it.id_producto === producto.id_producto
            ? { ...it, cantidad: it.cantidad + 1 }
            : it,
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
        it.id_producto === id_producto ? { ...it, cantidad: cantidadNum } : it,
      ),
    );
  }

  function quitarDelCarrito(id_producto) {
    setCarrito((prev) => prev.filter((it) => it.id_producto !== id_producto));
  }

  const total = carrito.reduce(
    (acc, it) => acc + it.precio_venta * it.cantidad,
    0,
  );

  const descuentoAplicado = clienteSeleccionado?.descuento || 0;
  const totalConDescuento = total * (1 - descuentoAplicado / 100);
  const ahorro = total - totalConDescuento;

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
      const clienteId = clienteSeleccionado?.id_cliente;
      if (clienteId) {
        payload.id_cliente = clienteId;
      }
      payload.total = totalConDescuento;
      const venta = await registrarVenta(payload);
      if (clienteId) {
        try {
          await api.patch(`/clientes/${clienteId}/sumar-punto`);
          await cargarClientes();
        } catch (puntoError) {
          console.error("Error sumando punto:", puntoError);
        }
      }
      const mensajeCliente = clienteSeleccionado
        ? ` con cliente ${clienteSeleccionado.nombre} (${descuentoAplicado}% descuento aplicado)`
        : " (venta libre)";
      setExito(
        `Venta #${venta.id_venta} registrada correctamente${mensajeCliente}`,
      );
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

  function resaltarTexto(texto, busqueda) {
    if (!busqueda.trim()) return texto;
    const partes = texto.split(
      new RegExp(`(${busqueda.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
    );
    return partes.map((parte, i) =>
      parte.toLowerCase() === busqueda.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 font-medium">
          {parte}
        </span>
      ) : (
        parte
      ),
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarVentas />
      <div className="flex-1 min-w-0">
        <HeaderModulo titulo="Punto de Venta" />
        <div className="p-4 sm:p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6 border-b border-stone/20 overflow-x-auto">
            <button
              onClick={() => setTab("pos")}
              className={`px-3 sm:px-4 py-2 font-display font-semibold text-sm sm:text-base whitespace-nowrap ${
                tab === "pos"
                  ? "text-primary border-b-2 border-primary"
                  : "text-stone"
              }`}
            >
              Registrar Venta
            </button>
            <button
              onClick={() => setTab("historial")}
              className={`px-3 sm:px-4 py-2 font-display font-semibold text-sm sm:text-base whitespace-nowrap ${
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
              <div
                className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4"
                ref={selectorRef}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <span className="text-sm font-medium text-stone">
                      Cliente:
                    </span>
                    {clienteSeleccionado ? (
                      <span className="text-ink font-semibold text-sm sm:text-base break-words">
                        {clienteSeleccionado.nombre}
                        <span className="text-xs sm:text-sm text-stone font-normal ml-1">
                          (Cód: {clienteSeleccionado.id_cliente} | Puntos:{" "}
                          {clienteSeleccionado.puntos ?? 0} | Descuento:{" "}
                          {clienteSeleccionado.descuento ?? 0}%)
                        </span>
                      </span>
                    ) : (
                      <span className="text-stone text-sm">Venta libre</span>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {!clienteSeleccionado ? (
                      <button
                        onClick={() =>
                          setMostrarSelectorCliente(!mostrarSelectorCliente)
                        }
                        className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded text-xs sm:text-sm flex items-center gap-1"
                      >
                        <Search className="w-3.5 h-3.5" />
                        {mostrarSelectorCliente ? "Cerrar" : "Buscar cliente"}
                      </button>
                    ) : (
                      <button
                        onClick={quitarCliente}
                        className="bg-gray-200 hover:bg-gray-300 text-ink px-3 py-1.5 rounded text-xs sm:text-sm flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Quitar
                      </button>
                    )}
                  </div>
                </div>

                {mostrarSelectorCliente && !clienteSeleccionado && (
                  <div className="mt-3 border-t pt-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar por código, nombre o teléfono..."
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
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {cargandoClientes ? (
                      <div className="text-center py-4 text-stone">
                        <div className="animate-pulse">
                          Cargando clientes...
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="text-xs text-stone mb-1">
                          {clientesFiltrados.length} cliente
                          {clientesFiltrados.length !== 1 ? "s" : ""} encontrado
                          {clientesFiltrados.length !== 1 ? "s" : ""}
                        </div>

                        <div className="max-h-64 overflow-y-auto border rounded-lg">
                          <div
                            className="px-3 sm:px-4 py-2 hover:bg-cream cursor-pointer border-b border-gray-100 flex items-center gap-2 transition-colors"
                            onClick={quitarCliente}
                          >
                            <User className="w-4 h-4 text-stone" />
                            <span className="font-medium text-sm">
                              Venta libre (sin cliente)
                            </span>
                          </div>

                          {clientesFiltrados.length === 0 &&
                            busquedaCliente && (
                              <div className="px-4 py-6 text-center text-stone">
                                <p>No se encontraron clientes</p>
                                <p className="text-xs mt-1">
                                  Intenta con otro término de búsqueda
                                </p>
                              </div>
                            )}

                          {clientesFiltrados.map((cliente) => (
                            <div
                              key={cliente.id_cliente}
                              className="px-3 sm:px-4 py-2 hover:bg-cream cursor-pointer border-b border-gray-100 last:border-0 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2"
                              onClick={() => seleccionarCliente(cliente)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm sm:text-base truncate">
                                  {resaltarTexto(
                                    cliente.nombre,
                                    busquedaCliente,
                                  )}
                                </div>
                                <div className="text-xs text-stone flex flex-wrap items-center gap-1 sm:gap-3">
                                  <span>Cód: {cliente.id_cliente}</span>
                                  <span>{cliente.telefono}</span>
                                  <span className="flex items-center gap-0.5">
                                    <Star className="w-3 h-3 text-accent" />{" "}
                                    Puntos: {cliente.puntos ?? 0}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Tag className="w-3 h-3 text-primary" />{" "}
                                    {cliente.descuento ?? 0}%
                                  </span>
                                </div>
                              </div>
                              <span className="text-primary text-xs sm:text-sm font-medium ml-0 sm:ml-2">
                                Seleccionar →
                              </span>
                            </div>
                          ))}
                        </div>

                        {clientesFiltrados.length > 5 && (
                          <div className="text-xs text-stone text-center mt-1 flex items-center justify-center gap-1">
                            <ChevronDown className="w-3 h-3" />
                            Usa la rueda del mouse para desplazarte
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Buscador de productos */}
              <div className="relative mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar producto por nombre..."
                    className="w-full rounded-lg border border-stone/30 pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {buscando && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone text-xs sm:text-sm">
                    Buscando...
                  </span>
                )}

                {resultados.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-stone/20 rounded-lg mt-1 shadow-lg max-h-48 sm:max-h-64 overflow-y-auto">
                    {resultados.map((producto) => (
                      <li
                        key={producto.id_producto}
                        onClick={() => agregarAlCarrito(producto)}
                        className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center px-3 sm:px-4 py-2 cursor-pointer hover:bg-cream gap-1 sm:gap-0"
                      >
                        <span className="text-sm sm:text-base text-ink">
                          {producto.nombre}
                        </span>
                        <span className="font-mono text-xs sm:text-sm text-stone">
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3">Producto</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3">
                          Precio unit.
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3">Cantidad</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3">Subtotal</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-6 text-center text-stone"
                          >
                            Aún no hay productos en la venta
                          </td>
                        </tr>
                      )}
                      {carrito.map((it) => (
                        <tr
                          key={it.id_producto}
                          className="border-t border-stone/10"
                        >
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-ink text-xs sm:text-sm">
                            {it.nombre}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm text-ink">
                            Bs {it.precio_venta.toFixed(2)}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <input
                              type="number"
                              min={1}
                              max={it.stock}
                              value={it.cantidad}
                              onChange={(e) =>
                                actualizarCantidad(
                                  it.id_producto,
                                  e.target.value,
                                )
                              }
                              className="w-14 sm:w-20 rounded border border-stone/30 px-1 sm:px-2 py-0.5 sm:py-1 font-mono text-xs sm:text-sm"
                            />
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm text-ink font-semibold">
                            Bs {(it.precio_venta * it.cantidad).toFixed(2)}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <button
                              onClick={() => quitarDelCarrito(it.id_producto)}
                              className="text-danger hover:underline text-xs sm:text-sm flex items-center gap-0.5 sm:gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total y confirmar */}
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="w-full sm:w-auto">
                  {clienteSeleccionado && descuentoAplicado > 0 && (
                    <div className="text-sm text-stone line-through">
                      Bs {total.toFixed(2)}
                    </div>
                  )}
                  <p className="font-mono text-xl sm:text-2xl text-primary font-semibold">
                    Total: Bs {totalConDescuento.toFixed(2)}
                  </p>
                  {clienteSeleccionado && descuentoAplicado > 0 && (
                    <div className="text-xs sm:text-sm">
                      <span className="text-success font-semibold">
                        {descuentoAplicado}% descuento aplicado
                      </span>
                      <span className="text-stone ml-2">
                        (Ahorro: Bs {ahorro.toFixed(2)})
                      </span>
                    </div>
                  )}
                  {clienteSeleccionado && (
                    <p className="text-xs sm:text-sm text-success mt-1">
                      Cliente: {clienteSeleccionado.nombre} - Se sumarán puntos
                    </p>
                  )}
                </div>
                <button
                  onClick={confirmarVenta}
                  disabled={registrando || carrito.length === 0}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-display font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  {registrando ? "Registrando..." : "Confirmar Venta"}
                </button>
              </div>

              {error && (
                <p className="mt-4 text-danger bg-danger/10 px-4 py-2 rounded-lg text-sm">
                  {error}
                </p>
              )}
              {exito && (
                <p className="mt-4 text-success bg-success/10 px-4 py-2 rounded-lg text-sm">
                  {exito}
                </p>
              )}
            </>
          )}

          {tab === "historial" && (
            <>
              {/* Filtro de fechas */}
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-3 sm:gap-4 bg-white rounded-lg shadow p-3 sm:p-4 mb-6">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm text-stone mb-1">Desde</label>
                  <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="w-full sm:w-auto rounded border border-stone/30 px-3 py-2 text-sm"
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label className="block text-sm text-stone mb-1">Hasta</label>
                  <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="w-full sm:w-auto rounded border border-stone/30 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={cargarHistorial}
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-display font-semibold px-4 sm:px-5 py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filtrar
                </button>
                {(desde || hasta) && (
                  <button
                    onClick={() => {
                      setDesde("");
                      setHasta("");
                      setTimeout(cargarHistorial, 0);
                    }}
                    className="text-stone hover:underline text-sm flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpiar filtro
                  </button>
                )}
              </div>

              {/* Tabla de historial */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3">#Venta</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3">Fecha</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3">Cliente</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3">Productos</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargandoHistorial && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-6 text-center text-stone"
                          >
                            Cargando...
                          </td>
                        </tr>
                      )}
                      {!cargandoHistorial && ventas.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-6 text-center text-stone"
                          >
                            No hay ventas registradas en este rango
                          </td>
                        </tr>
                      )}
                      {!cargandoHistorial &&
                        ventas.map((venta) => (
                          <tr
                            key={venta.id_venta}
                            className="border-t border-stone/10"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-ink font-mono text-xs sm:text-sm">
                              #{venta.id_venta}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-ink text-xs sm:text-sm">
                              {new Date(venta.fecha).toLocaleString("es-BO")}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-ink text-xs sm:text-sm">
                              {venta.cliente
                                ? venta.cliente.nombre
                                : "Sin cliente"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-stone text-xs sm:text-sm">
                              {venta.detalles.map((d) => (
                                <div key={d.id_detalle}>
                                  {d.producto?.nombre ??
                                    `Producto #${d.id_producto}`}{" "}
                                  × {d.cantidad}
                                </div>
                              ))}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-ink font-semibold text-xs sm:text-sm">
                              Bs {Number(venta.total).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {errorHistorial && (
                <p className="mt-4 text-danger bg-danger/10 px-4 py-2 rounded-lg text-sm">
                  {errorHistorial}
                </p>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default VentasPage;
