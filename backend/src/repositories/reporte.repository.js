const prisma = require('../config/prismaClient');

async function ventasEntreFechas(desde, hasta) {
  return prisma.venta.findMany({
    where: { fecha: { gte: desde, lte: hasta } },
    include: { detalles: { include: { producto: true } } },
  });
}

async function crearReporte(data) {
  return prisma.reporteVentas.create({ data });
}

module.exports = { ventasEntreFechas, crearReporte };
