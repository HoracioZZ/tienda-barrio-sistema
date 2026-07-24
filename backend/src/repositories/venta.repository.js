const prisma = require("../config/prismaClient");

// Ejecuta un callback dentro de una transaccion de Prisma.
// El service usa esto para orquestar pasos que deben ser atomicos.
function ejecutarTransaccion(callback) {
  return prisma.$transaction(callback);
}

async function obtenerProductoPorId(tx, id_producto) {
  return tx.producto.findUnique({ where: { id_producto } });
}

async function descontarStock(tx, id_producto, cantidad) {
  return tx.producto.update({
    where: { id_producto },
    data: { stock: { decrement: cantidad } },
  });
}

async function crearVentaConDetalles(
  tx,
  { id_usuario, id_cliente, total, detalles },
) {
  return tx.venta.create({
    data: {
      id_usuario,
      id_cliente: id_cliente || null,
      total,
      detalles: { create: detalles },
    },
    include: { detalles: true },
  });
}

async function listarVentas() {
  return prisma.venta.findMany({ include: { detalles: true, cliente: true } });
}

// RF-4: buscar productos por nombre (solo lectura)
async function buscarProductosPorNombre(nombre) {
  return prisma.producto.findMany({
    where: {
      estado: true,
      nombre: { contains: nombre, mode: "insensitive" },
    },
    orderBy: { nombre: "asc" },
  });
}

module.exports = {
  ejecutarTransaccion,
  obtenerProductoPorId,
  descontarStock,
  crearVentaConDetalles,
  listarVentas,
  buscarProductosPorNombre,
};
