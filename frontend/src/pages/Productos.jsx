import { useState, useEffect } from "react";
import {
  listarProductos,
  listarProductosPorCategoria,
  registrarProducto,
} from "../modules/inventario/productoService";
import { listarCategorias, registrarCategoria } from "../modules/inventario/categoriaService";
import { misAlertas } from "../modules/inventario/alertaService";
import SidebarInventario from "../components/SidebarInventario";
import HeaderModulo from "../components/HeaderModulo";

function Productos() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState([]);

  const [categoriaFiltro, setCategoriaFiltro] = useState("");

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

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarInventario />
      <div className="flex-1 flex flex-col">
        <HeaderModulo titulo="Productos y Catálogo" />

        <div className="p-6">
          {/* Alertas */}
          {alertas.length > 0 && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6">
              <p className="font-display font-semibold text-danger mb-2">
                Alertas ({alertas.length})
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
            <div className="flex items-center justify-between p-4 border-b border-stone/10">
              <h2 className="font-display font-semibold text-ink">Catálogo de productos</h2>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
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

            <table className="w-full text-left">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-3 text-sm font-sans">Nombre</th>
                  <th className="p-3 text-sm font-sans">Categoría</th>
                  <th className="p-3 text-sm font-sans">Precio compra</th>
                  <th className="p-3 text-sm font-sans">Precio venta</th>
                  <th className="p-3 text-sm font-sans">Stock</th>
                  <th className="p-3 text-sm font-sans">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
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
    </div>
  );
}

export default Productos;