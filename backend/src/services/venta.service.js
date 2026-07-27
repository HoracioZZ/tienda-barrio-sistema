// backend/src/services/venta.service.js
const ventaRepository = require("../repositories/venta.repository");

async function registrarVenta({ id_usuario, id_cliente, items }) {
  return ventaRepository.ejecutarTransaccion(async (tx) => {
    let subtotal = 0;
    const detalles = [];

    for (const item of items) {
      const producto = await ventaRepository.obtenerProductoPorId(tx, item.id_producto);
      if (!producto) throw new Error(`Producto ${item.id_producto} no existe`);
      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente de ${producto.nombre}`);
      }

      const subtotalItem = Number(producto.precio_venta) * item.cantidad;
      subtotal += subtotalItem;

      detalles.push({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: producto.precio_venta,
        subtotal: subtotalItem,
      });

      await ventaRepository.descontarStock(tx, item.id_producto, item.cantidad);
    }

    return ventaRepository.crearVentaConDetalles(tx, {
      id_usuario,
      id_cliente,
      detalles,
      subtotal,
    });
  });
}

async function obtenerVentas(filtros) {
  return ventaRepository.listarVentas(filtros);
}

async function buscarProductos(nombre) {
  if (!nombre || nombre.trim().length === 0) {
    return [];
  }
  return ventaRepository.buscarProductosPorNombre(nombre.trim());
}

module.exports = { 
  registrarVenta, 
  obtenerVentas, 
  buscarProductos 
};