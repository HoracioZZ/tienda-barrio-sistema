const prisma = require('../config/prismaClient');

async function crear(data) {
  return prisma.pedido.create({
    data,
    include: { detalles: { include: { producto: true } }, proveedor: true },
  });
}

async function listar() {
  return prisma.pedido.findMany({
    include: {
      detalles: { include: { producto: true } },
      proveedor: true,
      usuario: { select: { nombre: true } },
    },
    orderBy: { fecha: 'desc' },
  });
}

async function obtenerPorId(id_pedido) {
  return prisma.pedido.findUnique({
    where: { id_pedido: Number(id_pedido) },
    include: { detalles: { include: { producto: true } }, proveedor: true },
  });
}

module.exports = { crear, listar, obtenerPorId };