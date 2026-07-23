const ventaService = require('../services/venta.service');

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
  const ventas = await ventaService.obtenerVentas();
  res.json(ventas);
}

module.exports = { registrar, listar };
