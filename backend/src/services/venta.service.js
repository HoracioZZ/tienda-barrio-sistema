const ventaRepository = require('../repositories/venta.repository');
const prisma = require('../config/prismaClient');

// RF-1: registrar venta con calculo automatico del total
// RF-5: actualizar stock automaticamente
async function registrarVenta({ id_usuario, id_cliente, items }) {
  return prisma.$transaction(async (tx) => {
    let total = 0;
    const detalles = [];

    for (const item of items) {
      const producto = await tx.producto.findUnique({ where: { id_producto: item.id_producto } });
      if (!producto) throw new Error(`Producto ${item.id_producto} no existe`);
      if (producto.stock < item.cantidad) throw new Error(`Stock insuficiente de ${producto.nombre}`);

      const subtotal = Number(producto.precio_venta) * item.cantidad;
      total += subtotal;

      detalles.push({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: producto.precio_venta,
        subtotal,
      });

      await tx.producto.update({
        where: { id_producto: item.id_producto },
        data: { stock: { decrement: item.cantidad } },
      });
    }

    return tx.venta.create({
      data: {
        id_usuario,
        id_cliente: id_cliente || null,
        total,
        detalles: { create: detalles },
      },
      include: { detalles: true },
    });
  });
}

async function obtenerVentas() {
  return ventaRepository.listarVentas();
}

module.exports = { registrarVenta, obtenerVentas };
