const reporteRepository = require('../repositories/reporte.repository');

function crearFechaInicio(fecha) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia, 0, 0, 0, 0);
}

function crearFechaFin(fecha) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia, 23, 59, 59, 999);
}

function validarFechas(desde, hasta) {
  if (!desde || !hasta) {
    throw new Error('Debes seleccionar la fecha desde y la fecha hasta.');
  }

  const fechaDesde = crearFechaInicio(desde);
  const fechaHasta = crearFechaFin(hasta);

  if (fechaDesde > fechaHasta) {
    throw new Error('La fecha desde no puede ser mayor que la fecha hasta.');
  }

  return {
    fechaDesde,
    fechaHasta,
  };
}

function validarPeriodo(periodo, desde, hasta) {
  const [anioDesde, mesDesde, diaDesde] = desde.split('-').map(Number);
  const [anioHasta, mesHasta, diaHasta] = hasta.split('-').map(Number);

  if (periodo === 'Diario') {
    if (desde !== hasta) {
      throw new Error(
        'Para un reporte diario, la fecha desde y hasta deben ser el mismo día.'
      );
    }
  }

  if (periodo === 'Semanal') {
    const fechaDesde = crearFechaInicio(desde);
    const fechaHasta = crearFechaFin(hasta);

    const diferencia =
      (fechaHasta - fechaDesde) / (1000 * 60 * 60 * 24);

    if (diferencia < 6 || diferencia > 7) {
      throw new Error(
        'Para un reporte semanal debes seleccionar un período de aproximadamente 7 días.'
      );
    }
  }

  if (periodo === 'Mensual') {
    if (
      anioDesde !== anioHasta ||
      mesDesde !== mesHasta
    ) {
      throw new Error(
        'Para un reporte mensual, las fechas deben pertenecer al mismo mes y año.'
      );
    }
  }

  if (periodo === 'Anual') {
    if (anioDesde !== anioHasta) {
      throw new Error(
        'Para un reporte anual, las fechas deben pertenecer al mismo año.'
      );
    }
  }
}

// RF-14, RF-15:
// Reporte de ventas + ganancia total
async function generarReporte({
  id_usuario,
  periodo,
  desde,
  hasta,
}) {
  const fechas = validarFechas(desde, hasta);

  validarPeriodo(periodo, desde, hasta);

  const ventas = await reporteRepository.ventasEntreFechas(
    fechas.fechaDesde,
    fechas.fechaHasta
  );

  let totalVentas = 0;
  let gananciaTotal = 0;

  for (const venta of ventas) {
    totalVentas += Number(venta.total);

    for (const detalle of venta.detalles) {
      const precioVenta = Number(detalle.precio_unitario);
      const precioCompra = Number(detalle.producto.precio_compra);
      const cantidad = Number(detalle.cantidad);

      const ganancia =
        (precioVenta - precioCompra) * cantidad;

      gananciaTotal += ganancia;
    }
  }

  const reporte = await reporteRepository.crearReporte({
    periodo,
    total_ventas: totalVentas,
    ganancia_total: gananciaTotal,
    id_usuario,
  });

  return {
    reporte,
    ventasIncluidas: ventas.length,
  };
}

// RF-9:
// Productos más vendidos dentro del período seleccionado
async function productosMasVendidos(desde, hasta) {
  const fechas = validarFechas(desde, hasta);

  const ventas = await reporteRepository.ventasEntreFechas(
    fechas.fechaDesde,
    fechas.fechaHasta
  );

  const conteo = {};

  for (const venta of ventas) {
    for (const detalle of venta.detalles) {
      const nombre = detalle.producto.nombre;
      const cantidad = Number(detalle.cantidad);

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

module.exports = {
  generarReporte,
  productosMasVendidos,
};
