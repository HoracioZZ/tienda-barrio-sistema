import { useState, useEffect } from "react";
import {
  listarProductos,
  listarProductosPorCategoria,
  actualizarProducto,
  registrarProducto,
  eliminarProducto,
  subirImagenProducto,
} from "../modules/inventario/productoService";
import {
  listarCategorias,
  registrarCategoria,
  actualizarCategoria,
  eliminarCategoria,
  reactivarCategoria,
} from "../modules/inventario/categoriaService";

import {
  misAlertas,
  verificarAlertas,
} from "../modules/inventario/alertaService";
import SidebarInventario from "../components/SidebarInventario";
import HeaderModulo from "../components/HeaderModulo";
import Footer from "../components/Footer";
import ImagenProducto from "../components/ImagenProducto";
import {
  TriangleAlert,
  RefreshCw,
  Plus,
  X,
  Search,
  Edit,
  Trash2,
  RotateCcw,
  Bell,
  Upload,
} from "lucide-react";

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

  // Estados para imagen en nuevo producto
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenError, setImagenError] = useState("");
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Estados para imagen en edición
  const [imagenEditandoSeleccionada, setImagenEditandoSeleccionada] = useState(null);
  const [imagenEditandoPreview, setImagenEditandoPreview] = useState(null);
  const [imagenEditandoError, setImagenEditandoError] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");
  const [errorCategoria, setErrorCategoria] = useState("");
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nombreEditandoCategoria, setNombreEditandoCategoria] = useState("");
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  async function cargarDatos() {
    try {
      const [cats, prods, alts] = await Promise.all([
        listarCategorias(mostrarInactivas),
        categoriaFiltro
          ? listarProductosPorCategoria(categoriaFiltro)
          : listarProductos(),
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
  }, [categoriaFiltro, mostrarInactivas]);

  // Función para seleccionar imagen en nuevo producto
  function handleSeleccionarImagenNuevo(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImagenError("La imagen no puede superar los 5MB");
      return;
    }

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (!tiposPermitidos.includes(file.type)) {
      setImagenError("Solo se permiten formatos JPG, PNG o WEBP");
      return;
    }

    setImagenError("");
    setImagenSeleccionada(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // Función para seleccionar imagen en edición
  function handleSeleccionarImagenEdicion(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImagenEditandoError("La imagen no puede superar los 5MB");
      return;
    }

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (!tiposPermitidos.includes(file.type)) {
      setImagenEditandoError("Solo se permiten formatos JPG, PNG o WEBP");
      return;
    }

    setImagenEditandoError("");
    setImagenEditandoSeleccionada(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenEditandoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // Función para subir imagen en edición
  async function handleSubirImagenEdicion() {
    if (!imagenEditandoSeleccionada) return;

    setSubiendoImagen(true);
    setImagenEditandoError("");

    try {
      const formData = new FormData();
      formData.append("imagen", imagenEditandoSeleccionada);

      const productoActualizado = await subirImagenProducto(
        productoEditando.id_producto,
        formData
      );

      await cargarDatos();
      setExito("Imagen actualizada correctamente");

      setProductoEditando((prev) => ({
        ...prev,
        url_imagen: productoActualizado.url_imagen,
      }));

      setImagenEditandoSeleccionada(null);
      setImagenEditandoPreview(null);
    } catch (err) {
      setImagenEditandoError(
        err.response?.data?.error || "Error al subir la imagen"
      );
    } finally {
      setSubiendoImagen(false);
    }
  }

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
      const nuevoProducto = await registrarProducto({
        nombre: nombre.trim(),
        precio_compra: Number(precioCompra),
        precio_venta: Number(precioVenta),
        stock: stock ? Number(stock) : 0,
        stock_minimo: stockMinimo ? Number(stockMinimo) : 5,
        id_categoria: Number(idCategoria),
        fecha_vencimiento: fechaVencimiento
          ? `${fechaVencimiento}T00:00:00.000Z`
          : null,
      });

      if (imagenSeleccionada) {
        const formData = new FormData();
        formData.append("imagen", imagenSeleccionada);
        await subirImagenProducto(nuevoProducto.id_producto, formData);
      }

      setExito("Producto registrado correctamente.");
      setNombre("");
      setPrecioCompra("");
      setPrecioVenta("");
      setStock("");
      setStockMinimo("");
      setIdCategoria("");
      setFechaVencimiento("");
      setImagenSeleccionada(null);
      setImagenPreview(null);
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
      setErrorCategoria(
        err.response?.data?.error || "Error al registrar la categoría."
      );
    }
  }

  function abrirEdicionCategoria(c) {
    setCategoriaEditando(c);
    setNombreEditandoCategoria(c.nombre);
    setErrorCategoria("");
  }

  async function handleGuardarEdicionCategoria(e) {
    e.preventDefault();
    setErrorCategoria("");
    if (!nombreEditandoCategoria.trim()) {
      setErrorCategoria("El nombre es obligatorio.");
      return;
    }
    try {
      await actualizarCategoria(categoriaEditando.id_categoria, {
        nombre: nombreEditandoCategoria.trim(),
      });
      setCategoriaEditando(null);
      cargarDatos();
    } catch (err) {
      setErrorCategoria(
        err.response?.data?.error || "Error al actualizar la categoría."
      );
    }
  }

  async function confirmarEliminarCategoria() {
    if (!categoriaAEliminar) return;
    try {
      const respuesta = await eliminarCategoria(
        categoriaAEliminar.id_categoria
      );
      setCategoriaAEliminar(null);
      await cargarDatos();
      if (respuesta?.mensaje) {
        setExito(respuesta.mensaje);
      } else {
        setExito("Categoría eliminada correctamente.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar la categoría.");
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
      fecha_vencimiento: p.fecha_vencimiento
        ? p.fecha_vencimiento.slice(0, 10)
        : "",
      url_imagen: p.url_imagen,
    });
    setErrorEdicion("");
    setImagenEditandoSeleccionada(null);
    setImagenEditandoPreview(null);
    setImagenEditandoError("");
  }

  async function handleGuardarEdicion(e) {
    e.preventDefault();
    setErrorEdicion("");

    if (
      Number(productoEditando.precio_venta) <
      Number(productoEditando.precio_compra)
    ) {
      setErrorEdicion(
        "El precio de venta no puede ser menor al precio de compra."
      );
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
      setErrorEdicion(
        err.response?.data?.error || "Error al actualizar el producto."
      );
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
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderModulo titulo="Productos y Catálogo" />

        <div className="p-4 sm:p-6">
          {/* Alertas */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-0">
            <p className="font-display font-semibold text-ink text-base sm:text-lg">
              Alertas
            </p>
            <button
              onClick={async () => {
                await verificarAlertas();
                cargarDatos();
              }}
              className="flex items-center gap-1.5 text-sm bg-white border border-stone/20 rounded-lg px-3 py-1.5 text-ink hover:bg-cream transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Verificar ahora
            </button>
          </div>
          {alertas.length > 0 && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="font-display font-semibold text-danger mb-2 text-sm sm:text-base">
                {alertas.length} pendiente(s)
              </p>
              <ul className="space-y-1">
                {alertas.map((a) => (
                  <li
                    key={a.id_alerta}
                    className="text-xs sm:text-sm text-ink font-sans"
                  >
                    {a.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fila superior: formulario + categorias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <form
              onSubmit={handleSubmit}
              className="md:col-span-2 bg-white rounded-lg shadow-sm p-4 sm:p-5 space-y-3"
            >
              <h2 className="font-display font-semibold text-ink mb-2 text-base sm:text-lg">
                Nuevo producto
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-stone mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">
                    Precio compra
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">
                    Precio venta
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">
                    Stock inicial
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">
                    Stock mínimo
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">
                    Categoría
                  </label>
                  <select
                    value={idCategoria}
                    onChange={(e) => setIdCategoria(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                  <label className="block text-sm text-stone mb-1">
                    Vencimiento (opcional)
                  </label>
                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Campo para imagen al crear producto */}
                <div className="sm:col-span-2">
                  <label className="block text-sm text-stone mb-1">
                    Imagen del producto (opcional)
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {imagenPreview && (
                      <img
                        src={imagenPreview}
                        alt="Vista previa"
                        className="w-16 h-16 rounded-lg border border-stone/20 object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 bg-cream hover:bg-primary/10 text-ink px-3 py-2 rounded-lg border border-stone/20 transition-colors text-sm">
                          <Upload className="w-4 h-4" />
                          {subiendoImagen ? "Subiendo..." : "Seleccionar imagen"}
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleSeleccionarImagenNuevo}
                          className="hidden"
                        />
                      </label>
                      {imagenError && (
                        <p className="text-danger text-xs mt-1">{imagenError}</p>
                      )}
                      <p className="text-stone text-[10px] mt-1">
                        JPG, PNG o WEBP (máx. 5MB)
                      </p>
                    </div>
                    {imagenSeleccionada && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagenSeleccionada(null);
                          setImagenPreview(null);
                        }}
                        className="text-danger hover:text-danger/70 text-sm"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && <p className="text-danger text-sm">{error}</p>}
              {exito && <p className="text-success text-sm">{exito}</p>}

              <button
                type="submit"
                disabled={cargando}
                className="bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-50 text-sm sm:text-base"
              >
                {cargando ? "Guardando..." : "Registrar producto"}
              </button>
            </form>

            {/* Lista de categorias con editar/eliminar */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                <p className="font-display font-semibold text-ink text-sm sm:text-base">
                  Categorías
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setMostrarInactivas(!mostrarInactivas)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
                      mostrarInactivas
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-stone border-stone/30 hover:bg-cream"
                    }`}
                  >
                    {mostrarInactivas ? (
                      <>Ocultar inactivas</>
                    ) : (
                      <>Ver inactivas</>
                    )}
                  </button>
                  <button
                    onClick={() => setModalCategoriaAbierto(true)}
                    className="flex items-center gap-1 text-sm bg-primary hover:bg-primary-dark text-white rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva
                  </button>
                </div>
              </div>
              <ul className="space-y-1 max-h-56 overflow-y-auto">
                {categorias.map((c) => {
                  const productosEnCategoria = productos.filter(
                    (p) => p.id_categoria === c.id_categoria
                  ).length;
                  return (
                    <li
                      key={c.id_categoria}
                      className="flex flex-wrap items-center justify-between text-sm py-1.5 border-b border-stone/10 last:border-0 gap-1"
                    >
                      <span className="text-ink flex items-center gap-2 text-xs sm:text-sm">
                        {c.nombre}
                        {!c.estado && (
                          <span className="text-[10px] sm:text-xs bg-danger/20 text-danger px-2 py-0.5 rounded-full">
                            Inactiva
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => abrirEdicionCategoria(c)}
                          className="text-primary hover:text-primary-dark font-sans text-xs sm:text-sm"
                        >
                          Editar
                        </button>
                        {c.estado ? (
                          <button
                            onClick={() =>
                              setCategoriaAEliminar({
                                ...c,
                                productosCount: productosEnCategoria,
                              })
                            }
                            className="text-danger hover:text-danger/70 font-sans text-xs sm:text-sm"
                          >
                            Eliminar
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await reactivarCategoria(c.id_categoria);
                                cargarDatos();
                              } catch (err) {
                                setError(
                                  err.response?.data?.error ||
                                    "Error al reactivar"
                                );
                              }
                            }}
                            className="text-success hover:text-success/70 font-sans text-xs sm:text-sm"
                          >
                            Reactivar
                          </button>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b border-stone/10 gap-2 sm:gap-3">
              <h2 className="font-display font-semibold text-ink text-sm sm:text-base">
                Catálogo de productos
              </h2>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none min-w-30">
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busquedaProducto}
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value);
                      setProductoFiltrado(null);
                      setMostrarSugerencias(true);
                    }}
                    onFocus={() => setMostrarSugerencias(true)}
                    className="w-full sm:w-48 border border-stone/20 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {mostrarSugerencias &&
                    busquedaProducto &&
                    !productoFiltrado && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-stone/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {sugerencias.length === 0 ? (
                          <p className="px-3 py-2 text-stone text-sm font-sans">
                            Sin resultados.
                          </p>
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
                    className="flex items-center gap-1 text-sm text-stone hover:text-danger font-sans transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpiar
                  </button>
                )}

                <select
                  value={categoriaFiltro}
                  onChange={(e) => {
                    setCategoriaFiltro(e.target.value);
                    limpiarBusqueda();
                  }}
                  className="border border-stone/20 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-30"
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

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-sans">
                      Imagen
                    </th>
                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-sans">
                      Nombre
                    </th>
                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-sans">
                      Categoría
                    </th>
                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-sans">
                      Precio compra
                    </th>
                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-sans">
                      Precio venta
                    </th>
                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-sans">
                      Stock
                    </th>
                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-sans">
                      Vencimiento
                    </th>
                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-sans">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productosMostrados.map((p) => (
                    <tr key={p.id_producto} className="border-t border-stone/10">
                      <td className="p-2 sm:p-3">
                        <ImagenProducto
                          url={p.url_imagen}
                          nombre={p.nombre}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-stone/20"
                          fallbackText="📦"
                        />
                      </td>
                      <td className="p-2 sm:p-3 text-ink text-xs sm:text-sm">
                        {p.nombre}
                      </td>
                      <td className="p-2 sm:p-3 text-ink text-xs sm:text-sm">
                        {p.categoria?.nombre}
                      </td>
                      <td className="p-2 sm:p-3 font-mono text-ink text-xs sm:text-sm">
                        Bs {p.precio_compra}
                      </td>
                      <td className="p-2 sm:p-3 font-mono text-primary text-xs sm:text-sm font-semibold">
                        Bs {p.precio_venta}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
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
                      <td className="p-2 sm:p-3 text-ink text-xs sm:text-sm">
                        {p.fecha_vencimiento
                          ? new Date(p.fecha_vencimiento).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="p-2 sm:p-3 space-x-2 sm:space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => abrirEdicion(p)}
                          className="text-primary hover:text-primary-dark text-xs sm:text-sm font-sans"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setProductoAEliminar(p)}
                          className="text-danger hover:text-danger/70 text-xs sm:text-sm font-sans"
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
        <Footer />
      </div>

      {/* Modal registrar categoría */}
      {modalCategoriaAbierto && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 w-full max-w-xs sm:max-w-sm">
            <h3 className="font-display font-semibold text-ink mb-4 text-base sm:text-lg">
              Registrar categoría
            </h3>
            <form onSubmit={handleCrearCategoria} className="space-y-3">
              <div>
                <label className="block text-sm text-stone mb-1">Nombre</label>
                <input
                  type="text"
                  value={nuevaCategoriaNombre}
                  onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              {errorCategoria && (
                <p className="text-danger text-sm">{errorCategoria}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalCategoriaAbierto(false);
                    setErrorCategoria("");
                  }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-stone font-sans text-xs sm:text-sm hover:bg-cream"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar categoría */}
      {categoriaEditando && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 w-full max-w-xs sm:max-w-sm">
            <h3 className="font-display font-semibold text-ink mb-4 text-base sm:text-lg">
              Editar categoría
            </h3>
            <form onSubmit={handleGuardarEdicionCategoria} className="space-y-3">
              <div>
                <label className="block text-sm text-stone mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombreEditandoCategoria}
                  onChange={(e) => setNombreEditandoCategoria(e.target.value)}
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              {errorCategoria && (
                <p className="text-danger text-sm">{errorCategoria}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaEditando(null);
                    setErrorCategoria("");
                  }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-stone font-sans text-xs sm:text-sm hover:bg-cream"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminacion de categoría */}
      {categoriaAEliminar && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 w-full max-w-xs sm:max-w-sm text-center">
            <h3 className="font-display font-semibold text-ink mb-2 text-base sm:text-lg">
              Eliminar categoría
            </h3>
            <p className="text-stone text-sm font-sans mb-4">
              ¿Seguro que deseas eliminar{" "}
              <strong>{categoriaAEliminar.nombre}</strong>?
            </p>
            {categoriaAEliminar.productosCount > 0 && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 mb-4 text-sm text-danger font-sans flex items-start gap-2 text-left">
                <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  Esta categoría tiene{" "}
                  <strong>{categoriaAEliminar.productosCount}</strong>{" "}
                  producto(s) asignados.
                  <br />
                  Al eliminarla, serán reasignados a la categoría{" "}
                  <strong>"General"</strong>.
                </div>
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setCategoriaAEliminar(null)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-stone font-sans text-xs sm:text-sm hover:bg-cream"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminarCategoria}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-danger hover:bg-danger/80 text-white font-semibold text-xs sm:text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminacion de producto */}
      {productoAEliminar && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 w-full max-w-xs sm:max-w-sm text-center">
            <h3 className="font-display font-semibold text-ink mb-2 text-base sm:text-lg">
              Eliminar producto
            </h3>
            <p className="text-stone text-sm font-sans mb-6">
              ¿Seguro que deseas eliminar{" "}
              <strong>{productoAEliminar.nombre}</strong> del catálogo?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setProductoAEliminar(null)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-stone font-sans text-xs sm:text-sm hover:bg-cream"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminarProducto}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-danger hover:bg-danger/80 text-white font-semibold text-xs sm:text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar producto */}
      {productoEditando && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-semibold text-ink mb-4 text-base sm:text-lg">
              Editar producto
            </h3>
            <form onSubmit={handleGuardarEdicion} className="space-y-3">
              <div>
                <label className="block text-sm text-stone mb-1">Nombre</label>
                <input
                  type="text"
                  value={productoEditando.nombre}
                  onChange={(e) =>
                    setProductoEditando({
                      ...productoEditando,
                      nombre: e.target.value,
                    })
                  }
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-stone mb-1">
                    Precio compra
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productoEditando.precio_compra}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        precio_compra: e.target.value,
                      })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">
                    Precio venta
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productoEditando.precio_venta}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        precio_venta: e.target.value,
                      })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">Stock</label>
                  <input
                    type="number"
                    value={productoEditando.stock}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        stock: e.target.value,
                      })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">
                    Stock mínimo
                  </label>
                  <input
                    type="number"
                    value={productoEditando.stock_minimo}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        stock_minimo: e.target.value,
                      })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">
                    Categoría
                  </label>
                  <select
                    value={productoEditando.id_categoria}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        id_categoria: e.target.value,
                      })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {categorias.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-stone mb-1">
                    Vencimiento
                  </label>
                  <input
                    type="date"
                    value={productoEditando.fecha_vencimiento}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        fecha_vencimiento: e.target.value,
                      })
                    }
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {/* Sección de imagen en edición */}
              <div className="border-t border-stone/10 pt-3 mt-2">
                <label className="block text-sm text-stone mb-2">
                  Imagen del producto
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  <ImagenProducto
                    url={imagenEditandoPreview || productoEditando.url_imagen}
                    nombre={productoEditando.nombre}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-stone/20"
                    fallbackText="📦"
                  />
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 bg-cream hover:bg-primary/10 text-ink px-3 py-2 rounded-lg border border-stone/20 transition-colors text-sm">
                        <Upload className="w-4 h-4" />
                        {subiendoImagen ? "Subiendo..." : "Cambiar imagen"}
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleSeleccionarImagenEdicion}
                        disabled={subiendoImagen}
                        className="hidden"
                      />
                    </label>
                    {imagenEditandoError && (
                      <p className="text-danger text-xs mt-1">{imagenEditandoError}</p>
                    )}
                    <p className="text-stone text-[10px] mt-1">
                      JPG, PNG o WEBP (máx. 5MB)
                    </p>
                  </div>
                  {imagenEditandoSeleccionada && (
                    <button
                      type="button"
                      onClick={handleSubirImagenEdicion}
                      disabled={subiendoImagen}
                      className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                    >
                      {subiendoImagen ? "Subiendo..." : "Guardar imagen"}
                    </button>
                  )}
                </div>
              </div>

              {errorEdicion && (
                <p className="text-danger text-sm">{errorEdicion}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductoEditando(null)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-stone font-sans text-xs sm:text-sm hover:bg-cream"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm"
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