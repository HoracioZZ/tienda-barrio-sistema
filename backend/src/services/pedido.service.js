const pedidoRepository = require('../repositories/pedido.repository');
const productoRepository = require('../repositories/producto.repository');
const proveedorRepository = require('../repositories/proveedor.repository');
const prisma = require('../config/prismaClient');

const ESTADOS_VALIDOS = ['Pendiente', 'Recibido', 'Cancelado'];

// Calcula precios sobre la marcha (no se guardan en la BD, el esquema no tiene esas columnas)
function conTotales(pedido) {
  if (!pedido) return pedido;
  const detalles = (pedido.detalles || []).map((d) => {
    const precio_compra = Number(d.producto?.precio_compra || 0);
    const subtotal_estimado = precio_compra * d.cantidad_pedida;
    return { ...d, subtotal_estimado };
  });
  const total_estimado = detalles.reduce((acc, d) => acc + d.subtotal_estimado, 0);
  return { ...pedido, detalles, total_estimado };
}

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

  const pedido = await pedidoRepository.crear({
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

  return conTotales(pedido);
}

async function listarPedidos() {
  const pedidos = await pedidoRepository.listar();
  return pedidos.map(conTotales);
}

async function obtenerPedido(id_pedido) {
  const pedido = await pedidoRepository.obtenerPorId(id_pedido);
  if (!pedido) throw { status: 404, message: 'Pedido no encontrado.' };
  return conTotales(pedido);
}

async function cambiarEstadoPedido(id_pedido, estado) {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw { status: 400, message: `Estado inválido. Usa: ${ESTADOS_VALIDOS.join(', ')}.` };
  }
  const existente = await pedidoRepository.obtenerPorId(id_pedido);
  if (!existente) throw { status: 404, message: 'Pedido no encontrado.' };

  const actualizado = await pedidoRepository.actualizarEstado(id_pedido, estado);
  return conTotales(actualizado);
}

// RF-10: sugerencia de pedido segun stock bajo (pendiente: depende de productoRepository.stockBajo())
async function sugerenciaDePedido() {
  return productoRepository.stockBajo();
}

async function listarProveedores() {
  return proveedorRepository.listarActivos();
}

async function registrarProveedor({ nombre, contacto }) {
  if (!nombre || !nombre.trim()) {
    throw { status: 400, message: 'El nombre del proveedor es obligatorio.' };
  }
  return proveedorRepository.crear({ nombre: nombre.trim(), contacto: contacto || null, estado: true });
}

async function listarProductosDisponibles() {
  return pedidoRepository.listarProductosActivos();
}

module.exports = {
  registrarPedido,
  listarPedidos,
  obtenerPedido,
  cambiarEstadoPedido,
  sugerenciaDePedido,
  listarProveedores,
  registrarProveedor,
  listarProductosDisponibles,
};