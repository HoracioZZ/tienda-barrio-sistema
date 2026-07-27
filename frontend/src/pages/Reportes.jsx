import { useState } from "react";

import {
  generarReporte,
  productosMasVendidos,
  compararPeriodos,
} from "../modules/reportes/reporteService";

import SidebarCompras from "../components/SidebarCompras";
import HeaderModulo from "../components/HeaderModulo";

function Reportes() {
  const [periodo, setPeriodo] =
    useState("Personalizado");

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [reporte, setReporte] =
    useState(null);

  const [productos, setProductos] =
    useState([]);

  const [cargandoReporte, setCargandoReporte] =
    useState(false);

  const [cargandoProductos, setCargandoProductos] =
    useState(false);

  const [errorReporte, setErrorReporte] =
    useState("");

  const [errorProductos, setErrorProductos] =
    useState("");

  const [desde1, setDesde1] = useState("");
  const [hasta1, setHasta1] = useState("");

  const [desde2, setDesde2] = useState("");
  const [hasta2, setHasta2] = useState("");

  const [comparacion, setComparacion] =
    useState(null);

  const [cargandoComparacion, setCargandoComparacion] =
    useState(false);

  const [errorComparacion, setErrorComparacion] =
    useState("");

  function limpiarResultados() {
    setReporte(null);
    setProductos([]);
    setErrorReporte("");
    setErrorProductos("");
  }

  function cambiarPeriodo(nuevoPeriodo) {
    setPeriodo(nuevoPeriodo);

    limpiarResultados();

    if (nuevoPeriodo === "Personalizado") {
      setDesde("");
      setHasta("");
      return;
    }

    setDesde("");
    setHasta("");
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
      const fechaInicio =
        new Date(`${desde}T00:00:00`);

      const fechaFin =
        new Date(fechaInicio);

      fechaFin.setDate(
        fechaFin.getDate() + 6
      );

      return {
        desde,
        hasta: fechaFin
          .toISOString()
          .slice(0, 10),
      };
    }

    if (periodo === "Mensual") {
      const partes = desde.split("-");

      const anio = Number(partes[0]);
      const mes = Number(partes[1]);

      const ultimoDia =
        new Date(
          anio,
          mes,
          0
        ).getDate();

      return {
        desde:
          `${anio}-${String(mes).padStart(2, "0")}-01`,

        hasta:
          `${anio}-${String(mes).padStart(2, "0")}-${String(
            ultimoDia
          ).padStart(2, "0")}`,
      };
    }

    if (periodo === "Anual") {
      const anio =
        Number(desde.substring(0, 4));

      return {
        desde: `${anio}-01-01`,
        hasta: `${anio}-12-31`,
      };
    }

    return null;
  }

  function validarPeriodo() {
    if (!desde) {
      return "Selecciona la fecha del período.";
    }

    if (
      periodo === "Personalizado" &&
      !hasta
    ) {
      return "Selecciona la fecha hasta.";
    }

    const rango =
      obtenerRangoPeriodo();

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

    const error =
      validarPeriodo();

    if (error) {
      setErrorReporte(error);
      return;
    }

    const rango =
      obtenerRangoPeriodo();

    setCargandoReporte(true);

    try {
      const resultado =
        await generarReporte({
          periodo,
          desde: rango.desde,
          hasta: rango.hasta,
        });

      setReporte(resultado);
    } catch (error) {
      setErrorReporte(
        error.response?.data?.error ||
          "No se pudo generar el reporte."
      );
    } finally {
      setCargandoReporte(false);
    }
  }

  async function handleProductosMasVendidos() {
    setErrorProductos("");
    setProductos([]);

    const error =
      validarPeriodo();

    if (error) {
      setErrorProductos(error);
      return;
    }

    const rango =
      obtenerRangoPeriodo();

    setCargandoProductos(true);

    try {
      const resultado =
        await productosMasVendidos(
          rango.desde,
          rango.hasta
        );

      setProductos(
        Array.isArray(resultado)
          ? resultado
          : []
      );
    } catch (error) {
      setErrorProductos(
        error.response?.data?.error ||
          "No se pudieron obtener los productos más vendidos."
      );
    } finally {
      setCargandoProductos(false);
    }
  }

  async function handleCompararPeriodos() {
    setErrorComparacion("");
    setComparacion(null);

    if (
      !desde1 ||
      !hasta1 ||
      !desde2 ||
      !hasta2
    ) {
      setErrorComparacion(
        "Debes seleccionar las fechas de ambos períodos."
      );

      return;
    }

    if (desde1 > hasta1) {
      setErrorComparacion(
        "El período 1 tiene fechas incorrectas."
      );

      return;
    }

    if (desde2 > hasta2) {
      setErrorComparacion(
        "El período 2 tiene fechas incorrectas."
      );

      return;
    }

    setCargandoComparacion(true);

    try {
      const resultado =
        await compararPeriodos(
          desde1,
          hasta1,
          desde2,
          hasta2
        );

      setComparacion(resultado);
    } catch (error) {
      setErrorComparacion(
        error.response?.data?.error ||
          "No se pudieron comparar los períodos."
      );
    } finally {
      setCargandoComparacion(false);
    }
  }

  const rangoActual =
    obtenerRangoPeriodo();

  const maxProductos =
    productos.length > 0
      ? productos[0].cantidad
      : 1;

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarCompras />

      <div className="flex-1 min-w-0">
        <HeaderModulo titulo="Reportes" />

        <div className="p-4 md:p-6">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-ink">
              Reportes del sistema
            </h2>

            <p className="text-stone text-sm font-sans mt-1">
              Consulta ventas, ganancias,
              productos más vendidos y
              comparación entre períodos.
            </p>
          </div>

          {/* PERIODO */}
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
                  onChange={(e) =>
                    cambiarPeriodo(
                      e.target.value
                    )
                  }
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink"
                >
                  <option value="Personalizado">
                    Personalizado
                  </option>

                  <option value="Diario">
                    Diario
                  </option>

                  <option value="Semanal">
                    Semanal
                  </option>

                  <option value="Mensual">
                    Mensual
                  </option>

                  <option value="Anual">
                    Anual
                  </option>
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
                  type={
                    periodo === "Anual"
                      ? "number"
                      : "date"
                  }
                  value={
                    periodo === "Anual"
                      ? desde
                        ? desde.substring(0, 4)
                        : ""
                      : desde
                  }
                  min={
                    periodo === "Anual"
                      ? "2000"
                      : undefined
                  }
                  max={
                    periodo === "Anual"
                      ? "2100"
                      : undefined
                  }
                  onChange={(e) => {
                    if (
                      periodo === "Anual"
                    ) {
                      setDesde(
                        `${e.target.value}-01-01`
                      );

                      setHasta(
                        `${e.target.value}-12-31`
                      );
                    } else {
                      setDesde(
                        e.target.value
                      );

                      if (
                        periodo !==
                        "Personalizado"
                      ) {
                        setHasta("");
                      }
                    }

                    limpiarResultados();
                  }}
                  className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink"
                />
              </div>

              {periodo ===
                "Personalizado" && (
                <div>
                  <label className="block text-sm text-stone mb-1">
                    Hasta
                  </label>

                  <input
                    type="date"
                    value={hasta}
                    onChange={(e) => {
                      setHasta(
                        e.target.value
                      );

                      limpiarResultados();
                    }}
                    className="w-full border border-stone/20 rounded-lg px-3 py-2 text-ink"
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
                  Desde{" "}
                  {rangoActual.desde}{" "}
                  hasta{" "}
                  {rangoActual.hasta}
                </p>
              </div>
            )}
          </div>

          {/* VENTAS Y GANANCIAS */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h3 className="font-display font-semibold text-ink text-lg">
                  Ventas y ganancias
                </h3>

                <p className="text-stone text-sm mt-1">
                  Consulta el total vendido
                  y la ganancia obtenida.
                </p>
              </div>

              <button
                onClick={
                  handleGenerarReporte
                }
                disabled={
                  cargandoReporte
                }
                className="bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
              >
                {cargandoReporte
                  ? "Generando..."
                  : "Generar reporte"}
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
                        reporte.reporte
                          ?.total_ventas || 0
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
                        reporte.reporte
                          ?.ganancia_total || 0
                      ).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-cream rounded-lg p-4">
                    <p className="text-stone text-sm">
                      Ventas incluidas
                    </p>

                    <p className="font-display text-2xl font-bold text-ink mt-1">
                      {reporte.ventasIncluidas ||
                        0}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-display font-semibold text-ink mb-4">
                    Ganancia por producto
                  </h4>

                  {reporte
                    .gananciasPorProducto
                    ?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-primary text-white">
                          <tr>
                            <th className="p-3 text-sm">
                              Producto
                            </th>

                            <th className="p-3 text-sm">
                              Ganancia
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {reporte.gananciasPorProducto.map(
                            (
                              producto,
                              index
                            ) => (
                              <tr
                                key={`${producto.nombre}-${index}`}
                                className="border-t border-stone/10"
                              >
                                <td className="p-3 text-sm font-semibold text-ink">
                                  {
                                    producto.nombre
                                  }
                                </td>

                                <td className="p-3 text-sm font-semibold text-success">
                                  Bs{" "}
                                  {Number(
                                    producto.ganancia
                                  ).toFixed(
                                    2
                                  )}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-stone text-sm">
                      No existen ventas en
                      este período.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PRODUCTOS MAS VENDIDOS */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h3 className="font-display font-semibold text-ink text-lg">
                  Productos más vendidos
                </h3>

                <p className="text-stone text-sm mt-1">
                  Productos ordenados de
                  mayor a menor cantidad
                  vendida.
                </p>
              </div>

              <button
                onClick={
                  handleProductosMasVendidos
                }
                disabled={
                  cargandoProductos
                }
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
              <div>
                {/* GRAFICO */}
                <div className="mb-8">
                  <h4 className="font-display font-semibold text-ink mb-4">
                    Gráfico de productos
                    más vendidos
                  </h4>

                  <div className="space-y-4">
                    {productos
                      .slice(0, 5)
                      .map(
                        (
                          producto,
                          index
                        ) => {
                          const porcentaje =
                            (producto.cantidad /
                              maxProductos) *
                            100;

                          return (
                            <div
                              key={`grafico-${producto.nombre}-${index}`}
                            >
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold text-ink">
                                  {
                                    producto.nombre
                                  }
                                </span>

                                <span className="text-stone">
                                  {
                                    producto.cantidad
                                  }
                                </span>
                              </div>

                              <div className="w-full bg-cream rounded-full h-4">
                                <div
                                  className="bg-primary h-4 rounded-full"
                                  style={{
                                    width: `${porcentaje}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                  </div>
                </div>

                {/* TABLA */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th className="p-3 text-sm">
                          Posición
                        </th>

                        <th className="p-3 text-sm">
                          Producto
                        </th>

                        <th className="p-3 text-sm">
                          Cantidad vendida
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {productos.map(
                        (
                          producto,
                          index
                        ) => (
                          <tr
                            key={`${producto.nombre}-${index}`}
                            className="border-t border-stone/10"
                          >
                            <td className="p-3 text-sm text-ink">
                              {index + 1}
                            </td>

                            <td className="p-3 text-sm font-semibold text-ink">
                              {
                                producto.nombre
                              }
                            </td>

                            <td className="p-3 text-sm font-semibold text-primary">
                              {
                                producto.cantidad
                              }
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              !cargandoProductos &&
              !errorProductos && (
                <div className="border border-stone/10 rounded-lg p-6 text-center">
                  <p className="text-stone text-sm">
                    Selecciona un período y
                    pulsa "Consultar" para
                    ver los productos más
                    vendidos.
                  </p>
                </div>
              )
            )}
          </div>

          {/* RF-16 COMPARAR PERIODOS */}
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="mb-5">
              <h3 className="font-display font-semibold text-ink text-lg">
                Comparar períodos
              </h3>

              <p className="text-stone text-sm mt-1">
                Compara ventas y ganancias
                entre dos períodos
                diferentes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PERIODO 1 */}
              <div className="bg-cream rounded-lg p-4">
                <h4 className="font-semibold text-ink mb-3">
                  Período 1
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-stone mb-1">
                      Desde
                    </label>

                    <input
                      type="date"
                      value={desde1}
                      onChange={(e) =>
                        setDesde1(
                          e.target.value
                        )
                      }
                      className="w-full border border-stone/20 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-stone mb-1">
                      Hasta
                    </label>

                    <input
                      type="date"
                      value={hasta1}
                      onChange={(e) =>
                        setHasta1(
                          e.target.value
                        )
                      }
                      className="w-full border border-stone/20 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* PERIODO 2 */}
              <div className="bg-cream rounded-lg p-4">
                <h4 className="font-semibold text-ink mb-3">
                  Período 2
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-stone mb-1">
                      Desde
                    </label>

                    <input
                      type="date"
                      value={desde2}
                      onChange={(e) =>
                        setDesde2(
                          e.target.value
                        )
                      }
                      className="w-full border border-stone/20 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-stone mb-1">
                      Hasta
                    </label>

                    <input
                      type="date"
                      value={hasta2}
                      onChange={(e) =>
                        setHasta2(
                          e.target.value
                        )
                      }
                      className="w-full border border-stone/20 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={
                handleCompararPeriodos
              }
              disabled={
                cargandoComparacion
              }
              className="mt-5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
            >
              {cargandoComparacion
                ? "Comparando..."
                : "Comparar períodos"}
            </button>

            {errorComparacion && (
              <p className="text-danger text-sm mt-4">
                {errorComparacion}
              </p>
            )}

            {comparacion && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-stone/10 rounded-lg p-4">
                    <h4 className="font-semibold text-ink mb-2">
                      Período 1
                    </h4>

                    <p className="text-sm text-stone">
                      {
                        comparacion
                          .periodo1
                          .desde
                      }{" "}
                      →{" "}
                      {
                        comparacion
                          .periodo1
                          .hasta
                      }
                    </p>

                    <p className="text-xl font-bold text-primary mt-3">
                      Bs{" "}
                      {Number(
                        comparacion
                          .periodo1
                          .totalVentas
                      ).toFixed(2)}
                    </p>

                    <p className="text-sm text-success mt-1">
                      Ganancia: Bs{" "}
                      {Number(
                        comparacion
                          .periodo1
                          .gananciaTotal
                      ).toFixed(2)}
                    </p>

                    <p className="text-sm text-stone mt-1">
                      Ventas:{" "}
                      {
                        comparacion
                          .periodo1
                          .cantidadVentas
                      }
                    </p>
                  </div>

                  <div className="border border-stone/10 rounded-lg p-4">
                    <h4 className="font-semibold text-ink mb-2">
                      Período 2
                    </h4>

                    <p className="text-sm text-stone">
                      {
                        comparacion
                          .periodo2
                          .desde
                      }{" "}
                      →{" "}
                      {
                        comparacion
                          .periodo2
                          .hasta
                      }
                    </p>

                    <p className="text-xl font-bold text-primary mt-3">
                      Bs{" "}
                      {Number(
                        comparacion
                          .periodo2
                          .totalVentas
                      ).toFixed(2)}
                    </p>

                    <p className="text-sm text-success mt-1">
                      Ganancia: Bs{" "}
                      {Number(
                        comparacion
                          .periodo2
                          .gananciaTotal
                      ).toFixed(2)}
                    </p>

                    <p className="text-sm text-stone mt-1">
                      Ventas:{" "}
                      {
                        comparacion
                          .periodo2
                          .cantidadVentas
                      }
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-cream rounded-lg p-5">
                  <h4 className="font-semibold text-ink mb-3">
                    Resultado de la comparación
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-stone">
                        Diferencia en ventas
                      </p>

                      <p className="text-xl font-bold text-primary">
                        Bs{" "}
                        {Number(
                          comparacion
                            .diferenciaVentas
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-stone">
                        Diferencia en ganancia
                      </p>

                      <p className="text-xl font-bold text-success">
                        Bs{" "}
                        {Number(
                          comparacion
                            .diferenciaGanancia
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-stone">
                        Variación de ventas
                      </p>

                      <p className="text-xl font-bold text-ink">
                        {Number(
                          comparacion
                            .porcentajeVentas
                        ).toFixed(2)}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-stone text-xs font-sans mt-6">
            © 2026 Tienda de Barrio.
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Reportes;