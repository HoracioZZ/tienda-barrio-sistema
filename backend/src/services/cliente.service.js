const clienteRepository = require("../repositories/cliente.repository");

// RF-12: registrar cliente frecuente
async function registrarCliente(data) {
  if (!data.nombre) throw new Error("El nombre es obligatorio");
  return clienteRepository.crear(data);
}

async function listarClientes() {
  return clienteRepository.listar();
}

// RF-13: asignar puntos/descuento
async function asignarPuntos(id_cliente, puntos) {
  if (puntos < 0) throw new Error("Los puntos no pueden ser negativos");
  return clienteRepository.actualizarPuntos(id_cliente, puntos);
}

module.exports = { registrarCliente, listarClientes, asignarPuntos };
