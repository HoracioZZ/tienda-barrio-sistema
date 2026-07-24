const ventaRepository = require('../repositories/venta.repository');

// RF-1: registrar venta con calculo automatico del total
// RF-5: actualizar stock automaticamente
// Toda la logica de negocio vive aqui; el repository solo ejecuta las consultas.
async function registrarVenta({ id_usuario, id_cliente, items }) {
  return ventaRepository.ejecutarTransaccion(async (tx) => {
    let total = 0;
    const detalles = [];

    for (const item of items) {
      const producto = await ventaRepository.obtenerProductoPorId(tx, item.id_producto);
      if (!producto) throw new Error(`Producto ${item.id_producto} no existe`);
      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente de ${producto.nombre}`);
      }

      const subtotal = Number(producto.precio_venta) * item.cantidad;
      total += subtotal;

      detalles.push({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: producto.precio_venta,
        subtotal,
      });

      await ventaRepository.descontarStock(tx, item.id_producto, item.cantidad);
    }

    return ventaRepository.crearVentaConDetalles(tx, {
      id_usuario,
      id_cliente,
      total,
      detalles,
    });
  });
}

async function obtenerVentas() {
  return ventaRepository.listarVentas();
}

// RF-4: buscar productos por nombre
async function buscarProductos(nombre) {
  if (!nombre || nombre.trim().length === 0) {
    return [];
  }
  return ventaRepository.buscarProductosPorNombre(nombre.trim());
}

module.exports = { registrarVenta, obtenerVentas, buscarProductos };