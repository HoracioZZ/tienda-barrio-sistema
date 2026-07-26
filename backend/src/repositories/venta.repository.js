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

// Bolivia esta en UTC-4 todo el año (sin horario de verano).
// Al filtrar por "dia calendario" boliviano, hay que anclar el rango
// usando ese offset explicito, no UTC puro, o el ultimo dia del rango
// se corta ~4 horas antes de tiempo.
const OFFSET_BOLIVIA = '-04:00';

async function listarVentas({ desde, hasta } = {}) {
  const where = {};
  if (desde || hasta) {
    where.fecha = {};
    if (desde) {
      where.fecha.gte = new Date(`${desde}T00:00:00.000${OFFSET_BOLIVIA}`);
    }
    if (hasta) {
      where.fecha.lte = new Date(`${hasta}T23:59:59.999${OFFSET_BOLIVIA}`);
    }
  }
  return prisma.venta.findMany({
    where,
    include: {
      detalles: { include: { producto: true } },
      cliente: true,
    },
    orderBy: { fecha: 'desc' },
  });
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
