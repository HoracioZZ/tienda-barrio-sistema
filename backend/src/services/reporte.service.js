const reporteRepository = require("../repositories/reporte.repository");

function crearFechaInicio(fecha) {
  const [anio, mes, dia] = fecha.split("-").map(Number);

  return new Date(
    anio,
    mes - 1,
    dia,
    0,
    0,
    0,
    0
  );
}

function crearFechaFin(fecha) {
  const [anio, mes, dia] = fecha.split("-").map(Number);

  return new Date(
    anio,
    mes - 1,
    dia,
    23,
    59,
    59,
    999
  );
}

function validarFechas(desde, hasta) {
  if (!desde || !hasta) {
    throw new Error(
      "Debes seleccionar la fecha desde y la fecha hasta."
    );
  }

  const fechaDesde = crearFechaInicio(desde);
  const fechaHasta = crearFechaFin(hasta);

  if (fechaDesde > fechaHasta) {
    throw new Error(
      "La fecha desde no puede ser mayor que la fecha hasta."
    );
  }

  return {
    fechaDesde,
    fechaHasta,
  };
}

function validarPeriodo(periodo, desde, hasta) {
  const [anioDesde, mesDesde] = desde
    .split("-")
    .map(Number);

  const [anioHasta, mesHasta] = hasta
    .split("-")
    .map(Number);

  if (periodo === "Diario") {
    if (desde !== hasta) {
      throw new Error(
        "Para un reporte diario, la fecha desde y hasta deben ser el mismo día."
      );
    }
  }

  if (periodo === "Semanal") {
    const fechaDesde = crearFechaInicio(desde);
    const fechaHasta = crearFechaFin(hasta);

    const diferencia =
      (fechaHasta - fechaDesde) /
      (1000 * 60 * 60 * 24);

    if (diferencia < 6 || diferencia > 7) {
      throw new Error(
        "Para un reporte semanal debes seleccionar un período de aproximadamente 7 días."
      );
    }
  }

  if (periodo === "Mensual") {
    if (
      anioDesde !== anioHasta ||
      mesDesde !== mesHasta
    ) {
      throw new Error(
        "Para un reporte mensual, las fechas deben pertenecer al mismo mes y año."
      );
    }
  }

  if (periodo === "Anual") {
    if (anioDesde !== anioHasta) {
      throw new Error(
        "Para un reporte anual, las fechas deben pertenecer al mismo año."
      );
    }
  }
}

// RF-14 y RF-15
// Reporte de ventas, ganancia total y ganancia por producto
async function generarReporte({
  id_usuario,
  periodo,
  desde,
  hasta,
}) {
  const fechas = validarFechas(desde, hasta);

  validarPeriodo(periodo, desde, hasta);

  const ventas =
    await reporteRepository.ventasEntreFechas(
      fechas.fechaDesde,
      fechas.fechaHasta
    );

  let totalVentas = 0;
  let gananciaTotal = 0;

  const gananciasPorProducto = {};

  for (const venta of ventas) {
    totalVentas += Number(venta.total);

    for (const detalle of venta.detalles) {
      const precioVenta =
        Number(detalle.precio_unitario);

      const precioCompra =
        Number(detalle.producto.precio_compra);

      const cantidad =
        Number(detalle.cantidad);

      const ganancia =
        (precioVenta - precioCompra) * cantidad;

      gananciaTotal += ganancia;

      const nombreProducto =
        detalle.producto.nombre;

      if (gananciasPorProducto[nombreProducto]) {
        gananciasPorProducto[nombreProducto] += ganancia;
      } else {
        gananciasPorProducto[nombreProducto] = ganancia;
      }
    }
  }

  const reporte =
    await reporteRepository.crearReporte({
      periodo,
      total_ventas: totalVentas,
      ganancia_total: gananciaTotal,
      id_usuario,
    });

  const gananciasOrdenadas =
    Object.entries(gananciasPorProducto)
      .sort((a, b) => b[1] - a[1])
      .map(([nombre, ganancia]) => ({
        nombre,
        ganancia,
      }));

  return {
    reporte,
    ventasIncluidas: ventas.length,
    gananciasPorProducto: gananciasOrdenadas,
  };
}

// RF-9
// Productos más vendidos
async function productosMasVendidos(
  desde,
  hasta
) {
  const fechas = validarFechas(desde, hasta);

  const ventas =
    await reporteRepository.ventasEntreFechas(
      fechas.fechaDesde,
      fechas.fechaHasta
    );

  const conteo = {};

  for (const venta of ventas) {
    for (const detalle of venta.detalles) {
      const nombre =
        detalle.producto.nombre;

      const cantidad =
        Number(detalle.cantidad);

      if (conteo[nombre]) {
        conteo[nombre] += cantidad;
      } else {
        conteo[nombre] = cantidad;
      }
    }
  }

  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }));
}

// RF-16
// Comparar ventas entre dos períodos
async function compararPeriodos(
  desde1,
  hasta1,
  desde2,
  hasta2
) {
  const fechas1 = validarFechas(
    desde1,
    hasta1
  );

  const fechas2 = validarFechas(
    desde2,
    hasta2
  );

  const ventas1 =
    await reporteRepository.ventasEntreFechas(
      fechas1.fechaDesde,
      fechas1.fechaHasta
    );

  const ventas2 =
    await reporteRepository.ventasEntreFechas(
      fechas2.fechaDesde,
      fechas2.fechaHasta
    );

  let total1 = 0;
  let total2 = 0;

  let ganancia1 = 0;
  let ganancia2 = 0;

  for (const venta of ventas1) {
    total1 += Number(venta.total);

    for (const detalle of venta.detalles) {
      const precioVenta =
        Number(detalle.precio_unitario);

      const precioCompra =
        Number(detalle.producto.precio_compra);

      const cantidad =
        Number(detalle.cantidad);

      ganancia1 +=
        (precioVenta - precioCompra) *
        cantidad;
    }
  }

  for (const venta of ventas2) {
    total2 += Number(venta.total);

    for (const detalle of venta.detalles) {
      const precioVenta =
        Number(detalle.precio_unitario);

      const precioCompra =
        Number(detalle.producto.precio_compra);

      const cantidad =
        Number(detalle.cantidad);

      ganancia2 +=
        (precioVenta - precioCompra) *
        cantidad;
    }
  }

  const diferenciaVentas =
    total2 - total1;

  const diferenciaGanancia =
    ganancia2 - ganancia1;

  let porcentajeVentas = 0;

  if (total1 !== 0) {
    porcentajeVentas =
      (diferenciaVentas / total1) * 100;
  }

  return {
    periodo1: {
      desde: desde1,
      hasta: hasta1,
      totalVentas: total1,
      gananciaTotal: ganancia1,
      cantidadVentas: ventas1.length,
    },

    periodo2: {
      desde: desde2,
      hasta: hasta2,
      totalVentas: total2,
      gananciaTotal: ganancia2,
      cantidadVentas: ventas2.length,
    },

    diferenciaVentas,
    diferenciaGanancia,
    porcentajeVentas,
  };
}

module.exports = {
  generarReporte,
  productosMasVendidos,
  compararPeriodos,
};
