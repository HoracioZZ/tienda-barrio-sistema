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

async function actualizarEstado(id_pedido, estado) {
  return prisma.pedido.update({
    where: { id_pedido: Number(id_pedido) },
    data: { estado },
    include: { detalles: { include: { producto: true } }, proveedor: true },
  });
}

// Nota: consulta directa de solo lectura a la tabla producto (no toca archivos de Wendy)
async function listarProductosActivos() {
  return prisma.producto.findMany({
    where: { estado: true },
    orderBy: { nombre: 'asc' },
  });
}

module.exports = { crear, listar, obtenerPorId, actualizarEstado, listarProductosActivos };