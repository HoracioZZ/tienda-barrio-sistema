const productoRepository = require('../repositories/producto.repository');
const categoriaRepository = require('../repositories/categoria.repository');

function validarDatosProducto(data) {
  if (!data.nombre || !data.nombre.trim()) {
    throw new Error('El nombre del producto es obligatorio');
  }
  if (data.precio_compra === undefined || Number(data.precio_compra) < 0) {
    throw new Error('El precio de compra debe ser un numero mayor o igual a 0');
  }
  if (data.precio_venta === undefined || Number(data.precio_venta) < 0) {
    throw new Error('El precio de venta debe ser un numero mayor o igual a 0');
  }
  if (!data.id_categoria) {
    throw new Error('Debe indicar la categoria del producto');
  }
}

// RF-2, RF-3
async function registrarProducto(data) {
  validarDatosProducto(data);

  const categoriaExiste = await categoriaRepository.obtenerPorId(data.id_categoria);
  if (!categoriaExiste) {
    throw new Error('La categoria indicada no existe');
  }

  return productoRepository.crear({
    nombre: data.nombre.trim(),
    precio_compra: data.precio_compra,
    precio_venta: data.precio_venta,
    stock: data.stock ?? 0,
    stock_minimo: data.stock_minimo ?? 5,
    fecha_vencimiento: data.fecha_vencimiento ?? null,
    id_categoria: Number(data.id_categoria),
    url_imagen: data.url_imagen ?? null,
  });
}

async function listarProductos() {
  return productoRepository.listar();
}

// RF-3
async function listarProductosPorCategoria(id_categoria) {
  const categoriaExiste = await categoriaRepository.obtenerPorId(id_categoria);
  if (!categoriaExiste) {
    throw new Error('La categoria indicada no existe');
  }
  return productoRepository.listarPorCategoria(id_categoria);
}

// RF-4 
async function buscarProducto(nombre) {
  return productoRepository.buscarPorNombre(nombre);
}

async function actualizarProducto(id, data) {
  const existente = await productoRepository.obtenerPorId(id);
  if (!existente) throw new Error('Producto no encontrado');

  if (data.id_categoria) {
    const categoriaExiste = await categoriaRepository.obtenerPorId(data.id_categoria);
    if (!categoriaExiste) throw new Error('La categoria indicada no existe');
  }

  return productoRepository.actualizar(id, data);
}

async function eliminarProducto(id) {
  const existente = await productoRepository.obtenerPorId(id);
  if (!existente) throw new Error('Producto no encontrado');
  return productoRepository.eliminar(id);
}

// RF-6
async function verificarStockBajo() {
  return productoRepository.stockBajo();
}

module.exports = {
  registrarProducto, listarProductos, listarProductosPorCategoria,
  buscarProducto, actualizarProducto, eliminarProducto, verificarStockBajo,
};