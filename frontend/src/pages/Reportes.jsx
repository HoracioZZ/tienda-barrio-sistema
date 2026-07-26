import { useState } from "react";
import {
  generarReporte,
  productosMasVendidos,
} from "../modules/reportes/reporteService";
import SidebarCompras from "../components/SidebarCompras";
import HeaderModulo from "../components/HeaderModulo";

function Reportes() {
  const [periodo, setPeriodo] = useState("Personalizado");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [reporte, setReporte] = useState(null);
  const [productos, setProductos] = useState([]);

  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  const [errorReporte, setErrorReporte] = useState("");
  const [errorProductos, setErrorProductos] = useState("");

  function cambiarPeriodo(nuevoPeriodo) {
    setPeriodo(nuevoPeriodo);
    setReporte(null);
    setProductos([]);
    setErrorReporte("");
    setErrorProductos("");

    if (nuevoPeriodo === "Personalizado") {
      setDesde("");
      setHasta("");
      return;
    }

    if (nuevoPeriodo === "Diario") {
      setDesde("");
      setHasta("");
      return;
    }

    if (nuevoPeriodo === "Semanal") {
      setDesde("");
      setHasta("");
      return;
    }

    if (nuevoPeriodo === "Mensual") {
      setDesde("");
      setHasta("");
      return;
    }

    if (nuevoPeriodo === "Anual") {
      setDesde("");
      setHasta("");
    }
  }

  function obtenerRangoPeriodo() {
    if (!desde) {
      return null;
    }

    if (periodo === "Personalizado") {
      if (!hasta) {
        return null;
      }

      return {
        desde,
        hasta,
      };
    }

    if (periodo === "Diario") {
      return {
        desde,
        hasta: desde,
      };
    }

    if (periodo === "Semanal") {
      const fechaInicio = new Date(`${desde}T00:00:00`);
      const fechaFin = new Date(fechaInicio);

      fechaFin.setDate(fechaFin.getDate() + 6);

      return {
        desde,
        hasta: fechaFin.toISOString().slice(0, 10),
      };
    }

    if (periodo === "Mensual") {
      const partes = desde.split("-");

      const año = Number(partes[0]);
      const mes = Number(partes[1]);

      const ultimoDia = new Date(año, mes, 0).getDate();

      return {
        desde: `${año}-${String(mes).padStart(2, "0")}-01`,
        hasta: `${año}-${String(mes).padStart(2, "0")}-${String(
          ultimoDia
        ).padStart(2, "0")}`,
      };
    }

    if (periodo === "Anual") {
      const año = Number(desde.substring(0, 4));

      return {
        desde: `${año}-01-01`,
        hasta: `${año}-12-31`,
      };
    }

    return null;
  }

  function validarPeriodo() {
    if (!desde) {
      return "Selecciona la fecha del período.";
    }

    if (periodo === "Personalizado" && !hasta) {
      return "Selecciona la fecha hasta.";
    }

    const rango = obtenerRangoPeriodo();

    if (!rango) {
      return "No se pudo determinar el período seleccionado.";
    }

    if (rango.desde > rango.hasta) {
      return "La fecha desde no puede ser mayor que la fecha hasta.";
    }

    return "";
  }

  async function handleGenerarReporte(e) {
    e.preventDefault();

    setErrorReporte("");
    setReporte(null);

    const error = validarPeriodo();

    if (error) {
      setErrorReporte(error);
      return;
    }

    const rango = obtenerRangoPeriodo();

    setCargandoReporte(true);

    try {
      const resultado = await generarReporte({
        periodo,
        desde: rango.desde,
        hasta: rango.hasta,
      });

      setReporte(resultado);
    } catch (error) {
      setErrorReporte(
        error.response?.data?.error || "No se pudo generar el reporte."
      );
    } finally {
      setCargandoReporte(false);
    }
  }

  async function handleProductosMasVendidos() {
    setErrorProductos("");
    setProductos([]);

    const error = validarPeriodo();

    if (error) {
      setErrorProductos(error);
      return;
    }

    const rango = obtenerRangoPeriodo();

    setCargandoProductos(true);

    try {
      const resultado = await productosMasVendidos(
        rango.desde,
        rango.hasta
      );

      setProductos(Array.isArray(resultado) ? resultado : []);
    } catch (error) {
      console.error("Error productos más vendidos:", error);

      setErrorProductos(
        error.response?.data?.error ||
          "No se pudieron obtener los productos más vendidos."
      );
    } finally {
      setCargandoProductos(false);
    }
  }

  const rangoActual = obtenerRangoPeriodo();

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarCompras />

      <div className="flex-1 flex flex-col">
        <HeaderModulo titulo="Reportes" />

        <div className="p-6">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-ink">
              Reportes del sistema
            </h2>

            <p className="text-stone text-sm font-sans mt-1">
              Consulta las ventas, ganancias y productos más vendidos por
              período.
            </p>
          </div>

          {/* PERÍODO */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <h3 className="font-display font-semibold text-ink mb-4">
              Período del reporte
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-stone mb-1">
                  Tipo de período
                </label>

                <select
                  value={periodo}
                  onChange={(e) => cambiarPeriodo(e.target.value)}
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="Personalizado">Personalizado</option>
                  <option value="Diario">Diario</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Mensual">Mensual</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-stone mb-1">
                  {periodo === "Anual"
                    ? "Año"
                    : periodo === "Mensual"
                    ? "Mes"
                    : periodo === "Semanal"
                    ? "Fecha de inicio"
                    : "Desde"}
                </label>

                <input
                  type={periodo === "Anual" ? "number" : "date"}
                  value={
                    periodo === "Anual"
                      ? desde
                        ? desde.substring(0, 4)
                        : ""
                      : desde
                  }
                  min={periodo === "Anual" ? "2000" : undefined}
                  max={periodo === "Anual" ? "2100" : undefined}
                  onChange={(e) => {
                    if (periodo === "Anual") {
                      setDesde(`${e.target.value}-01-01`);
                      setHasta(`${e.target.value}-12-31`);
                    } else {
                      setDesde(e.target.value);
                      if (periodo !== "Personalizado") {
                        setHasta("");
                      }
                    }

                    setReporte(null);
                    setProductos([]);
                    setErrorReporte("");
                    setErrorProductos("");
                  }}
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {periodo === "Personalizado" && (
                <div>
                  <label className="block text-sm text-stone mb-1">
                    Hasta
                  </label>

                  <input
                    type="date"
                    value={hasta}
                    onChange={(e) => {
                      setHasta(e.target.value);
                      setReporte(null);
                      setProductos([]);
                      setErrorReporte("");
                      setErrorProductos("");
                    }}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              )}
            </div>

            {rangoActual && (
              <div className="mt-4 bg-cream rounded-lg p-4">
                <p className="text-sm text-stone">
                  Período seleccionado:
                </p>

                <p className="text-sm font-semibold text-ink mt-1">
                  Desde {rangoActual.desde} hasta {rangoActual.hasta}
                </p>
              </div>
            )}
          </div>

          {/* VENTAS Y GANANCIAS */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-ink text-lg">
                  Ventas y ganancias
                </h3>

                <p className="text-stone text-sm mt-1">
                  Consulta el total vendido y la ganancia obtenida.
                </p>
              </div>

              <button
                onClick={handleGenerarReporte}
                disabled={cargandoReporte}
                className="bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
              >
                {cargandoReporte ? "Generando..." : "Generar reporte"}
              </button>
            </div>

            {errorReporte && (
              <p className="text-danger text-sm mb-4">
                {errorReporte}
              </p>
            )}

            {reporte && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-cream rounded-lg p-4">
                    <p className="text-stone text-sm">
                      Total de ventas
                    </p>

                    <p className="font-display text-2xl font-bold text-primary mt-1">
                      Bs{" "}
                      {Number(
                        reporte.reporte?.total_ventas || 0
                      ).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-cream rounded-lg p-4">
                    <p className="text-stone text-sm">
                      Ganancia total
                    </p>

                    <p className="font-display text-2xl font-bold text-success mt-1">
                      Bs{" "}
                      {Number(
                        reporte.reporte?.ganancia_total || 0
                      ).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-cream rounded-lg p-4">
                    <p className="text-stone text-sm">
                      Ventas incluidas
                    </p>

                    <p className="font-display text-2xl font-bold text-ink mt-1">
                      {reporte.ventasIncluidas || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-sm text-stone">
                  <p>
                    Tipo de período:{" "}
                    <span className="font-semibold text-ink">
                      {reporte.reporte?.periodo || periodo}
                    </span>
                  </p>

                  <p>
                    Desde:{" "}
                    <span className="font-semibold text-ink">
                      {rangoActual?.desde}
                    </span>{" "}
                    — Hasta:{" "}
                    <span className="font-semibold text-ink">
                      {rangoActual?.hasta}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PRODUCTOS MÁS VENDIDOS */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-ink text-lg">
                  Productos más vendidos
                </h3>

                <p className="text-stone text-sm mt-1">
                  Productos ordenados de mayor a menor cantidad vendida.
                </p>

                {rangoActual && (
                  <p className="text-primary text-xs mt-2 font-semibold">
                    Consulta: {rangoActual.desde} → {rangoActual.hasta}
                  </p>
                )}
              </div>

              <button
                onClick={handleProductosMasVendidos}
                disabled={cargandoProductos}
                className="bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
              >
                {cargandoProductos
                  ? "Consultando..."
                  : "Consultar"}
              </button>
            </div>

            {errorProductos && (
              <p className="text-danger text-sm mb-4">
                {errorProductos}
              </p>
            )}

            {productos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="p-3 text-sm font-sans">
                        Posición
                      </th>

                      <th className="p-3 text-sm font-sans">
                        Producto
                      </th>

                      <th className="p-3 text-sm font-sans">
                        Cantidad vendida
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {productos.map((producto, index) => (
                      <tr
                        key={`${producto.nombre}-${index}`}
                        className="border-t border-stone/10"
                      >
                        <td className="p-3 text-ink text-sm">
                          {index + 1}
                        </td>

                        <td className="p-3 text-ink text-sm font-semibold">
                          {producto.nombre}
                        </td>

                        <td className="p-3 text-primary text-sm font-semibold">
                          {producto.cantidad}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !cargandoProductos &&
              !errorProductos && (
                <div className="border border-stone/10 rounded-lg p-6 text-center">
                  <p className="text-stone text-sm">
                    Selecciona un período y pulsa "Consultar" para ver
                    los productos más vendidos.
                  </p>
                </div>
              )
            )}
          </div>

          <p className="text-center text-stone text-xs font-sans mt-6">
            © 2026 Tienda de Barrio. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Reportes;