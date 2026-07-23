const prisma = require('../config/prismaClient');

async function crear(data) {
  return prisma.pedido.create({ data, include: { detalles: true } });
}

async function listar() {
  return prisma.pedido.findMany({ include: { detalles: true, proveedor: true } });
}

module.exports = { crear, listar };
