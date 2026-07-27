const productoService = require('../services/producto.service');

async function registrar(req, res) {
  try {
    const producto = await productoService.registrarProducto(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listar(req, res) {
  res.json(await productoService.listarProductos());
}

async function listarPorCategoria(req, res) {
  try {
    const productos = await productoService.listarProductosPorCategoria(req.params.id_categoria);
    res.json(productos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function buscar(req, res) {
  res.json(await productoService.buscarProducto(req.query.nombre || ''));
}

async function actualizar(req, res) {
  try {
    const producto = await productoService.actualizarProducto(req.params.id, req.body);
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    await productoService.eliminarProducto(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function alertasStockBajo(req, res) {
  res.json(await productoService.verificarStockBajo());
}

async function subirImagen(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibio ningun archivo' });
    }
    const urlImagen = `/uploads/${req.file.filename}`;
    const producto = await productoService.actualizarImagenProducto(req.params.id, urlImagen);
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { registrar, listar, listarPorCategoria, buscar, actualizar, eliminar, alertasStockBajo, subirImagen };