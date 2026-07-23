const reporteRepository = require('../repositories/reporte.repository');

// RF-14, RF-15: reporte de ventas + ganancia por producto
async function generarReporte({ id_usuario, periodo, desde, hasta }) {
  const ventas = await reporteRepository.ventasEntreFechas(new Date(desde), new Date(hasta));

  let totalVentas = 0;
  let gananciaTotal = 0;

  for (const venta of ventas) {
    totalVentas += Number(venta.total);
    for (const detalle of venta.detalles) {
      const ganancia = (Number(detalle.precio_unitario) - Number(detalle.producto.precio_compra)) * detalle.cantidad;
      gananciaTotal += ganancia;
    }
  }

  const reporte = await reporteRepository.crearReporte({
    periodo,
    total_ventas: totalVentas,
    ganancia_total: gananciaTotal,
    id_usuario,
  });

  return { reporte, ventasIncluidas: ventas.length };
}

// RF-9: productos mas vendidos
async function productosMasVendidos(desde, hasta) {
  const ventas = await reporteRepository.ventasEntreFechas(new Date(desde), new Date(hasta));
  const conteo = {};

  for (const venta of ventas) {
    for (const detalle of venta.detalles) {
      const nombre = detalle.producto.nombre;
      conteo[nombre] = (conteo[nombre] || 0) + detalle.cantidad;
    }
  }

  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, cantidad]) => ({ nombre, cantidad }));
}

module.exports = { generarReporte, productosMasVendidos };
