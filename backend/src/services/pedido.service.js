const pedidoRepository = require('../repositories/pedido.repository');
const productoRepository = require('../repositories/producto.repository');
const proveedorRepository = require('../repositories/proveedor.repository');
const prisma = require('../config/prismaClient');

// RF-11: registrar pedido a proveedor
async function registrarPedido({ id_usuario, id_proveedor, items }) {
  if (!id_proveedor) {
    throw { status: 400, message: 'Debe indicar el proveedor.' };
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: 'El pedido debe tener al menos un producto.' };
  }
  for (const i of items) {
    if (!i.id_producto || !i.cantidad_pedida || i.cantidad_pedida <= 0) {
      throw { status: 400, message: 'Cada item necesita id_producto y cantidad_pedida > 0.' };
    }
  }

  const proveedor = await prisma.proveedor.findUnique({
    where: { id_proveedor: Number(id_proveedor) },
  });
  if (!proveedor || !proveedor.estado) {
    throw { status: 404, message: 'Proveedor no encontrado o inactivo.' };
  }

  const idsProductos = items.map((i) => Number(i.id_producto));
  const productosExistentes = await prisma.producto.findMany({
    where: { id_producto: { in: idsProductos } },
  });
  if (productosExistentes.length !== idsProductos.length) {
    throw { status: 404, message: 'Uno o más productos no existen.' };
  }

  return pedidoRepository.crear({
    id_usuario,
    id_proveedor: Number(id_proveedor),
    estado: 'Pendiente',
    detalles: {
      create: items.map((i) => ({
        id_producto: Number(i.id_producto),
        cantidad_pedida: Number(i.cantidad_pedida),
      })),
    },
  });
}

async function listarPedidos() {
  return pedidoRepository.listar();
}

async function obtenerPedido(id_pedido) {
  const pedido = await pedidoRepository.obtenerPorId(id_pedido);
  if (!pedido) throw { status: 404, message: 'Pedido no encontrado.' };
  return pedido;
}

// RF-10: sugerencia de pedido segun stock bajo
async function sugerenciaDePedido() {
  return productoRepository.stockBajo();
}

async function listarProveedores() {
  return proveedorRepository.listarActivos();
}

module.exports = {
  registrarPedido,
  listarPedidos,
  obtenerPedido,
  sugerenciaDePedido,
  listarProveedores,
};