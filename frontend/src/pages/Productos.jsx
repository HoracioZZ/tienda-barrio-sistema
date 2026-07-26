import { useState, useEffect } from "react";
import {
  listarProductos,
  listarProductosPorCategoria,
  actualizarProducto,
  registrarProducto,
  eliminarProducto,
} from "../modules/inventario/productoService";
import { listarCategorias, registrarCategoria } from "../modules/inventario/categoriaService";

import { misAlertas, verificarAlertas } from "../modules/inventario/alertaService";
import SidebarInventario from "../components/SidebarInventario";
import HeaderModulo from "../components/HeaderModulo";

function Productos() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [productoFiltrado, setProductoFiltrado] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);
  const [errorEdicion, setErrorEdicion] = useState("");
  const [nombre, setNombre] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");
  const [errorCategoria, setErrorCategoria] = useState("");

  async function cargarDatos() {
    try {
      const [cats, prods, alts] = await Promise.all([
        listarCategorias(),
        categoriaFiltro ? listarProductosPorCategoria(categoriaFiltro) : listarProductos(),
        misAlertas(),
      ]);
      setCategorias(cats);
      setProductos(prods);
      setAlertas(alts);
    } catch (err) {
      setError("No se pudieron cargar los datos.");
    }
  }

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaFiltro]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setExito("");

    if (!nombre.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    if (!precioCompra || Number(precioCompra) <= 0) {
      setError("Ingresa un precio de compra válido, mayor a 0.");
      return;
    }
    if (!precioVenta || Number(precioVenta) <= 0) {
      setError("Ingresa un precio de venta válido, mayor a 0.");
      return;
    }
    if (Number(precioVenta) < Number(precioCompra)) {
      setError("El precio de venta no puede ser menor al precio de compra.");
      return;
    }
    if (!idCategoria) {
      setError("Selecciona una categoría.");
      return;
    }
    if (stock && Number(stock) < 0) {
      setError("El stock no puede ser negativo.");
      return;
    }
    if (stockMinimo && Number(stockMinimo) < 0) {
      setError("El stock mínimo no puede ser negativo.");
      return;
    }
    if (fechaVencimiento) {
      const hoy = new Date().toISOString().slice(0, 10);
      if (fechaVencimiento < hoy) {
        setError("La fecha de vencimiento no puede ser anterior a hoy.");
        return;
      }
    }

    setCargando(true);
    try {
      await registrarProducto({
        nombre: nombre.trim(),
        precio_compra: Number(precioCompra),
        precio_venta: Number(precioVenta),
        stock: stock ? Number(stock) : 0,
        stock_minimo: stockMinimo ? Number(stockMinimo) : 5,
        id_categoria: Number(idCategoria),
        fecha_vencimiento: fechaVencimiento ? `${fechaVencimiento}T00:00:00.000Z` : null,
      });
      setExito("Producto registrado correctamente.");
      setNombre("");
      setPrecioCompra("");
      setPrecioVenta("");
      setStock("");
      setStockMinimo("");
      setIdCategoria("");
      setFechaVencimiento("");
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar el producto.");
    } finally {
      setCargando(false);
    }
  }

  async function handleCrearCategoria(e) {
    e.preventDefault();
    setErrorCategoria("");
    if (!nuevaCategoriaNombre.trim()) {
      setErrorCategoria("El nombre es obligatorio.");
      return;
    }
    try {
      await registrarCategoria({ nombre: nuevaCategoriaNombre.trim() });
      setModalCategoriaAbierto(false);
      setNuevaCategoriaNombre("");
      cargarDatos();
    } catch (err) {
      setErrorCategoria(err.response?.data?.error || "Error al registrar la categoría.");
    }
  }

  async function confirmarEliminarProducto() {
    if (!productoAEliminar) return;
    try {
      await eliminarProducto(productoAEliminar.id_producto);
      setProductoAEliminar(null);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar el producto.");
    }
  }

  function abrirEdicion(p) {
    setProductoEditando({
      id_producto: p.id_producto,
      nombre: p.nombre,
      precio_compra: p.precio_compra,
      precio_venta: p.precio_venta,
      stock: p.stock,
      stock_minimo: p.stock_minimo,
      id_categoria: p.id_categoria,
      fecha_vencimiento: p.fecha_vencimiento ? p.fecha_vencimiento.slice(0, 10) : "",
    });
    setErrorEdicion("");
  }

  async function handleGuardarEdicion(e) {
    e.preventDefault();
    setErrorEdicion("");

    if (Number(productoEditando.precio_venta) < Number(productoEditando.precio_compra)) {
      setErrorEdicion("El precio de venta no puede ser menor al precio de compra.");
      return;
    }
    if (productoEditando.fecha_vencimiento) {
      const hoy = new Date().toISOString().slice(0, 10);
      if (productoEditando.fecha_vencimiento < hoy) {
        setErrorEdicion("La fecha de vencimiento no puede ser anterior a hoy.");
        return;
      }
    }

    try {
      await actualizarProducto(productoEditando.id_producto, {
        nombre: productoEditando.nombre.trim(),
        precio_compra: Number(productoEditando.precio_compra),
        precio_venta: Number(productoEditando.precio_venta),
        stock: Number(productoEditando.stock),
        stock_minimo: Number(productoEditando.stock_minimo),
        id_categoria: Number(productoEditando.id_categoria),
        fecha_vencimiento: productoEditando.fecha_vencimiento
          ? `${productoEditando.fecha_vencimiento}T00:00:00.000Z`
          : null,
      });
      setProductoEditando(null);
      cargarDatos();
    } catch (err) {
      setErrorEdicion(err.response?.data?.error || "Error al actualizar el producto.");
    }
  }
const sugerencias = busquedaProducto
    ? productos.filter((p) =>
        p.nombre.toLowerCase().startsWith(busquedaProducto.toLowerCase())
      )
    : [];

  const productosMostrados = productoFiltrado ? [productoFiltrado] : productos;

  function seleccionarProductoBusqueda(p) {
    setProductoFiltrado(p);
    setBusquedaProducto(p.nombre);
    setMostrarSugerencias(false);
  }

  function limpiarBusqueda() {
    setBusquedaProducto("");
    setProductoFiltrado(null);
  }
  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarInventario />
      <div className="flex-1 flex flex-col">
        <HeaderModulo titulo="Productos y Catálogo" />

        <div className="p-6">
          {/* Alertas */}
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-semibold text-ink">Alertas</p>
            <button
              onClick={async () => {
                await verificarAlertas();
                cargarDatos();
              }}
              className="text-sm bg-white border border-stone/20 rounded-lg px-3 py-1.5 text-ink hover:bg-cream"
            >
              Verificar ahora
            </button>
          </div>
          {alertas.length > 0 && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6">
              <p className="font-display font-semibold text-danger mb-2">
                {alertas.length} pendiente(s)
              </p>
              <ul className="space-y-1">
                {alertas.map((a) => (
                  <li key={a.id_alerta} className="text-sm text-ink font-sans">
                    {a.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fila superior: formulario + tarjeta */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-2 bg-white rounded-lg shadow-sm p-5 space-y-3"
            >
              <h2 className="font-display font-semibold text-ink mb-2">Nuevo producto</h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm text-stone mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">Precio compra</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">Precio venta</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">Stock inicial</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">Stock mínimo</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">Categoría</label>
                  <select
                    value={idCategoria}
                    onChange={(e) => setIdCategoria(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">Selecciona categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">Vencimiento (opcional)</label>
                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {error && <p className="text-danger text-sm">{error}</p>}
              {exito && <p className="text-success text-sm">{exito}</p>}

              <button
                type="submit"
                disabled={cargando}
                className="bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
              >
                {cargando ? "Guardando..." : "Registrar producto"}
              </button>
            </form>

            <div className="bg-primary/5 rounded-lg p-5 flex flex-col items-center justify-center text-center">
              <p className="font-display font-semibold text-primary mb-1">Organiza tu catálogo</p>
              <p className="text-stone text-sm font-sans mb-4">
                Crea categorías para clasificar tus productos.
              </p>
              <button
                onClick={() => setModalCategoriaAbierto(true)}
                className="bg-white border border-primary text-primary font-semibold rounded-lg px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors"
              >
                Registrar categoría
              </button>
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
           <div className="flex items-center justify-between p-4 border-b border-stone/10 gap-3">
              <h2 className="font-display font-semibold text-ink">Catálogo de productos</h2>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre..."
                    value={busquedaProducto}
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value);
                      setProductoFiltrado(null);
                      setMostrarSugerencias(true);
                    }}
                    onFocus={() => setMostrarSugerencias(true)}
                    className="border border-stone/20 rounded-lg px-3 py-2 text-sm text-ink w-56 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {mostrarSugerencias && busquedaProducto && !productoFiltrado && (
                    <div className="absolute z-10 mt-1 w-56 bg-white border border-stone/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {sugerencias.length === 0 ? (
                        <p className="px-3 py-2 text-stone text-sm font-sans">Sin resultados.</p>
                      ) : (
                        sugerencias.map((p) => (
                          <button
                            type="button"
                            key={p.id_producto}
                            onClick={() => seleccionarProductoBusqueda(p)}
                            className="w-full text-left px-3 py-2 hover:bg-cream text-sm text-ink font-sans"
                          >
                            {p.nombre}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {productoFiltrado && (
                  <button
                    onClick={limpiarBusqueda}
                    className="text-sm text-stone hover:text-danger font-sans"
                  >
                    Limpiar
                  </button>
                )}

                <select
                  value={categoriaFiltro}
                  onChange={(e) => {
                    setCategoriaFiltro(e.target.value);
                    limpiarBusqueda();
                  }}
                  className="border border-stone/20 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-3 text-sm font-sans">Nombre</th>
                  <th className="p-3 text-sm font-sans">Categoría</th>
                  <th className="p-3 text-sm font-sans">Precio compra</th>
                  <th className="p-3 text-sm font-sans">Precio venta</th>
                  <th className="p-3 text-sm font-sans">Stock</th>
                  <th className="p-3 text-sm font-sans">Vencimiento</th>
                  <th className="p-3 text-sm font-sans">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosMostrados.map((p) => (
                  <tr key={p.id_producto} className="border-t border-stone/10">
                    <td className="p-3 text-ink text-sm">{p.nombre}</td>
                    <td className="p-3 text-ink text-sm">{p.categoria?.nombre}</td>
                    <td className="p-3 font-mono text-ink text-sm">Bs {p.precio_compra}</td>
                    <td className="p-3 font-mono text-primary text-sm font-semibold">
                      Bs {p.precio_venta}
                    </td>
                    <td className="p-3 text-sm">
                      <span
                        className={
                          p.stock <= p.stock_minimo
                            ? "text-danger font-semibold"
                            : "text-ink"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3 text-ink text-sm">
                      {p.fecha_vencimiento
                        ? new Date(p.fecha_vencimiento).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-3 space-x-3">
                      <button
                        onClick={() => abrirEdicion(p)}
                        className="text-primary hover:text-primary-dark text-sm font-sans"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setProductoAEliminar(p)}
                        className="text-danger hover:text-danger/70 text-sm font-sans"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal registrar categoría */}
      {modalCategoriaAbierto && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="font-display font-semibold text-ink mb-4">Registrar categoría</h3>
            <form onSubmit={handleCrearCategoria} className="space-y-3">
              <div>
                <label className="block text-sm text-stone mb-1">Nombre</label>
                <input
                  type="text"
                  value={nuevaCategoriaNombre}
                  onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              {errorCategoria && <p className="text-danger text-sm">{errorCategoria}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalCategoriaAbierto(false);
                    setErrorCategoria("");
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

      {/* Modal confirmar eliminacion de producto */}
      {productoAEliminar && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="font-display font-semibold text-ink mb-2">Eliminar producto</h3>
            <p className="text-stone text-sm font-sans mb-6">
              ¿Seguro que deseas eliminar <strong>{productoAEliminar.nombre}</strong> del catálogo?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setProductoAEliminar(null)}
                className="px-4 py-2 rounded-lg text-stone font-sans text-sm hover:bg-cream"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminarProducto}
                className="px-4 py-2 rounded-lg bg-danger hover:bg-danger/80 text-white font-semibold text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar producto */}
      {productoEditando && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="font-display font-semibold text-ink mb-4">Editar producto</h3>
            <form onSubmit={handleGuardarEdicion} className="space-y-3">
              <div>
                <label className="block text-sm text-stone mb-1">Nombre</label>
                <input
                  type="text"
                  value={productoEditando.nombre}
                  onChange={(e) =>
                    setProductoEditando({ ...productoEditando, nombre: e.target.value })
                  }
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-stone mb-1">Precio compra</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productoEditando.precio_compra}
                    onChange={(e) =>
                      setProductoEditando({ ...productoEditando, precio_compra: e.target.value })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">Precio venta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productoEditando.precio_venta}
                    onChange={(e) =>
                      setProductoEditando({ ...productoEditando, precio_venta: e.target.value })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">Stock</label>
                  <input
                    type="number"
                    value={productoEditando.stock}
                    onChange={(e) =>
                      setProductoEditando({ ...productoEditando, stock: e.target.value })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">Stock mínimo</label>
                  <input
                    type="number"
                    value={productoEditando.stock_minimo}
                    onChange={(e) =>
                      setProductoEditando({ ...productoEditando, stock_minimo: e.target.value })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">Categoría</label>
                  <select
                    value={productoEditando.id_categoria}
                    onChange={(e) =>
                      setProductoEditando({ ...productoEditando, id_categoria: e.target.value })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {categorias.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">Vencimiento</label>
                  <input
                    type="date"
                    value={productoEditando.fecha_vencimiento}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        fecha_vencimiento: e.target.value,
                      })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {errorEdicion && <p className="text-danger text-sm">{errorEdicion}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductoEditando(null)}
                  className="px-4 py-2 rounded-lg text-stone font-sans text-sm hover:bg-cream"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;