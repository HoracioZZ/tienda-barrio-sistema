const productoRepository = require('../repositories/producto.repository');

// RF-2, RF-3: registrar producto con categoria
async function registrarProducto(data) {
  return productoRepository.crear(data);
}

async function listarProductos() {
  return productoRepository.listar();
}

// RF-4: busqueda de producto por nombre
async function buscarProducto(nombre) {
  return productoRepository.buscarPorNombre(nombre);
}

// RF-6: alerta de stock bajo
async function verificarStockBajo() {
  return productoRepository.stockBajo();
}

module.exports = { registrarProducto, listarProductos, buscarProducto, verificarStockBajo };
