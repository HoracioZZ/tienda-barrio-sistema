const prisma = require('../config/prismaClient');

async function crearVenta(data) {
  return prisma.venta.create({ data, include: { detalles: true } });
}

async function listarVentas() {
  return prisma.venta.findMany({ include: { detalles: true, cliente: true } });
}

module.exports = { crearVenta, listarVentas };
