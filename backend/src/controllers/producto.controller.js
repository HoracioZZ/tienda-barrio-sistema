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

async function buscar(req, res) {
  res.json(await productoService.buscarProducto(req.query.nombre || ''));
}

async function alertasStockBajo(req, res) {
  res.json(await productoService.verificarStockBajo());
}

module.exports = { registrar, listar, buscar, alertasStockBajo };
      