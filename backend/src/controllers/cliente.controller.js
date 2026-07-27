// src/controllers/cliente.controller.js
const clienteService = require("../services/cliente.service");

// Listar clientes
async function listar(req, res) {
  try {
    const clientes = await clienteService.listarClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Buscar clientes
async function buscar(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      const clientes = await clienteService.listarClientes();
      return res.json(clientes);
    }
    const clientes = await clienteService.buscarClientes(q);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener cliente
async function obtener(req, res) {
  try {
    const cliente = await clienteService.obtenerCliente(req.params.id);
    res.json(cliente);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

// Registrar cliente
async function registrar(req, res) {
  try {
    const cliente = await clienteService.registrarCliente(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Actualizar cliente
async function actualizar(req, res) {
  try {
    const cliente = await clienteService.actualizarCliente(req.params.id, req.body);
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Cambiar estado
async function cambiarEstado(req, res) {
  try {
    const { estado } = req.body;
    if (estado === undefined) {
      return res.status(400).json({ error: "El estado es requerido" });
    }
    const cliente = await clienteService.cambiarEstadoCliente(req.params.id, estado);
    res.json(cliente);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

// ✅ Sumar punto por compra
async function sumarPuntoPorCompra(req, res) {
  try {
    const { id } = req.params;
    const cliente = await clienteService.sumarPuntoPorCompra(id);
    res.json(cliente);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

// Eliminar cliente
async function eliminar(req, res) {
  try {
    const result = await clienteService.eliminarCliente(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

module.exports = {
  listar,
  buscar,
  obtener,
  registrar,
  actualizar,
  cambiarEstado,
  sumarPuntoPorCompra,
  eliminar
};