const clienteRepository = require('../repositories/cliente.repository');

// RF-12: registrar cliente frecuente
async function registrarCliente(data) {
  return clienteRepository.crear(data);
}

async function listarClientes() {
  return clienteRepository.listar();
}

// RF-13: asignar puntos/descuento
async function asignarPuntos(id_cliente, puntos) {
  return clienteRepository.actualizarPuntos(id_cliente, puntos);
}

module.exports = { registrarCliente, listarClientes, asignarPuntos };
