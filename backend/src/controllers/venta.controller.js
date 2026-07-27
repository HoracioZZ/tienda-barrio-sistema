// backend/src/controllers/venta.controller.js
const ventaService = require("../services/venta.service");

async function registrar(req, res) {
  try {
    const venta = await ventaService.registrarVenta({
      id_usuario: req.usuario.id_usuario,
      id_cliente: req.body.id_cliente,
      items: req.body.items,
    });
    res.status(201).json(venta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listar(req, res) {
  try {
    const { desde, hasta } = req.query;
    const ventas = await ventaService.obtenerVentas({ desde, hasta });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function buscarProductos(req, res) {
  try {
    const { q } = req.query;
    const productos = await ventaService.buscarProductos(q);
    res.json(productos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  registrar,
  listar,
  buscarProductos
};