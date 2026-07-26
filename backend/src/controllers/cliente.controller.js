const clienteService = require("../services/cliente.service");

async function registrar(req, res) {
  try {
    const cliente = await clienteService.registrarCliente(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listar(req, res) {
  const clientes = await clienteService.listarClientes();
  res.json(clientes);
}

async function asignarPuntos(req, res) {
  try {
    const cliente = await clienteService.asignarPuntos(
      Number(req.params.id),
      req.body.puntos
    );
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { registrar, listar, asignarPuntos };
