// backend/src/repositories/venta.repository.js
const prisma = require("../config/prismaClient");

// ✅ Función para calcular descuento según puntos (NO se guarda en BD)
function calcularDescuentoPorPuntos(puntos) {
  if (puntos >= 100) return 20;
  if (puntos >= 50) return 10;
  if (puntos >= 20) return 5;
  return 0;
}

function ejecutarTransaccion(callback) {
  return prisma.$transaction(callback);
}

async function obtenerProductoPorId(tx, id_producto) {
  return tx.producto.findUnique({ where: { id_producto } });
}

async function obtenerClientePorId(tx, id_cliente) {
  return tx.cliente.findUnique({ where: { id_cliente } });
}

async function descontarStock(tx, id_producto, cantidad) {
  return tx.producto.update({
    where: { id_producto },
    data: { stock: { decrement: cantidad } },
  });
}

async function crearVentaConDetalles(
  tx,
  { id_usuario, id_cliente, detalles, subtotal }
) {
  // 1. Calcular descuento según puntos del cliente
  let descuento = 0;
  if (id_cliente) {
    const cliente = await obtenerClientePorId(tx, id_cliente);
    if (cliente) {
      descuento = calcularDescuentoPorPuntos(cliente.puntos || 0);
    }
  }

  // 2. Calcular total final con descuento
  const totalFinal = Number((subtotal * (1 - descuento / 100)).toFixed(2));

  // 3. Crear la venta
  const venta = await tx.venta.create({
    data: {
      id_usuario,
      id_cliente: id_cliente || null,
      total: totalFinal,
      detalles: {
        create: detalles.map((d) => ({
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal: d.subtotal,
        })),
      },
    },
    include: { 
      detalles: { include: { producto: true } },
      cliente: true 
    },
  });

  // 4. Si tiene cliente, sumar punto
  if (id_cliente) {
    await sumarPuntoCliente(tx, id_cliente);
  }

  return venta;
}

async function sumarPuntoCliente(tx, id_cliente) {
  const cliente = await tx.cliente.findUnique({ where: { id_cliente } });
  if (!cliente) throw new Error("Cliente no encontrado");

  const nuevosPuntos = (cliente.puntos || 0) + 1;

  return tx.cliente.update({
    where: { id_cliente },
    data: {
      puntos: nuevosPuntos,
      numero_compras: (cliente.numero_compras || 0) + 1,
    },
  });
}

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
  obtenerClientePorId,
  descontarStock,
  crearVentaConDetalles,
  sumarPuntoCliente,
  listarVentas,
  buscarProductosPorNombre,
  calcularDescuentoPorPuntos,
};