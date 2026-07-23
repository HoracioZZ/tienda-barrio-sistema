const clienteService = require('../services/cliente.service');

async function registrar(req, res) {
  try {
    res.status(201).json(await clienteService.registrarCliente(req.body));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listar(req, res) {
  res.json(await clienteService.listarClientes());
}

async function asignarPuntos(req, res) {
  try {
    res.json(await clienteService.asignarPuntos(Number(req.params.id), req.body.puntos));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { registrar, listar, asignarPuntos };
