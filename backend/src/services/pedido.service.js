const pedidoRepository = require('../repositories/pedido.repository');
const productoRepository = require('../repositories/producto.repository');

// RF-11: registrar pedido a proveedor
async function registrarPedido({ id_usuario, id_proveedor, items }) {
  return pedidoRepository.crear({
    id_usuario,
    id_proveedor,
    estado: 'Pendiente',
    detalles: {
      create: items.map((i) => ({ id_producto: i.id_producto, cantidad_pedida: i.cantidad_pedida })),
    },
  });
}

async function listarPedidos() {
  return pedidoRepository.listar();
}

// RF-10: sugerencia de pedido segun stock bajo
async function sugerenciaDePedido() {
  return productoRepository.stockBajo();
}

module.exports = { registrarPedido, listarPedidos, sugerenciaDePedido };
