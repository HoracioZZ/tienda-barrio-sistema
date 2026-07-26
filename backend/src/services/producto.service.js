const productoRepository = require('../repositories/producto.repository');
const categoriaRepository = require('../repositories/categoria.repository');
const alertaRepository = require('../repositories/alerta.repository');
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

  const actualizado = await productoRepository.actualizar(id, data);
  await alertaRepository.eliminarPorProducto(id); // limpia alertas viejas con datos desactualizados
  return actualizado;
}

async function eliminarProducto(id) {
  const existente = await productoRepository.obtenerPorId(id);
  if (!existente) throw new Error('Producto no encontrado');
  const eliminado = await productoRepository.eliminar(id);
  await alertaRepository.eliminarPorProducto(id); // ya no debe alertar sobre un producto inactivo
  return eliminado;
}

// RF-6
async function verificarStockBajo() {
  return productoRepository.stockBajo();
}

module.exports = {
  registrarProducto, listarProductos, listarProductosPorCategoria,
  buscarProducto, actualizarProducto, eliminarProducto, verificarStockBajo,
};