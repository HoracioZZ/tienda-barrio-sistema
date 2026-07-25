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
    res.status(error.status || 500).json({ error: error.message || 'Error al registrar el pedido.' });
  }
}

async function listar(req, res) {
  try {
    res.json(await pedidoService.listarPedidos());
  } catch (error) {
    res.status(500).json({ error: 'Error al listar pedidos.' });
  }
}

async function obtener(req, res) {
  try {
    const pedido = await pedidoService.obtenerPedido(req.params.id);
    res.json(pedido);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Error al obtener el pedido.' });
  }
}

async function cambiarEstado(req, res) {
  try {
    const pedido = await pedidoService.cambiarEstadoPedido(req.params.id, req.body.estado);
    res.json(pedido);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Error al cambiar el estado.' });
  }
}

async function sugerencias(req, res) {
  try {
    res.json(await pedidoService.sugerenciaDePedido());
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sugerencias.' });
  }
}

async function proveedores(req, res) {
  try {
    res.json(await pedidoService.listarProveedores());
  } catch (error) {
    res.status(500).json({ error: 'Error al listar proveedores.' });
  }
}

async function crearProveedor(req, res) {
  try {
    const proveedor = await pedidoService.registrarProveedor(req.body);
    res.status(201).json(proveedor);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Error al registrar el proveedor.' });
  }
}

async function productos(req, res) {
  try {
    res.json(await pedidoService.listarProductosDisponibles());
  } catch (error) {
    res.status(500).json({ error: 'Error al listar productos.' });
  }
}

module.exports = {
  registrar,
  listar,
  obtener,
  cambiarEstado,
  sugerencias,
  proveedores,
  crearProveedor,
  productos,
};