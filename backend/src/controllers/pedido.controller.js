const pedidoService = require('../services/pedido.service');

async function registrar(req, res) {
  try {
    const pedido = await pedidoService.registrarPedido({
      id_usuario: req.usuario.id_usuario,
      id_proveedor: req.body.id_proveedor,
      items: req.body.items,
    });
    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listar(req, res) {
  res.json(await pedidoService.listarPedidos());
}

async function sugerencias(req, res) {
  res.json(await pedidoService.sugerenciaDePedido());
}

module.exports = { registrar, listar, sugerencias };
