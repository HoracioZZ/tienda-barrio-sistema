// backend/src/services/cliente.service.js
const clienteRepository = require("../repositories/cliente.repository");

// ✅ Función de descuento (se calcula en el servicio)
function calcularDescuentoPorPuntos(puntos) {
  if (puntos >= 100) return 20;
  if (puntos >= 50) return 10;
  if (puntos >= 20) return 5;
  return 0;
}

// Listar clientes (con descuento calculado)
async function listarClientes() {
  const clientes = await clienteRepository.listar();
  return clientes.map(c => ({
    ...c,
    descuento: calcularDescuentoPorPuntos(c.puntos || 0)
  }));
}

// Buscar clientes
async function buscarClientes(termino) {
  const clientes = await clienteRepository.buscar(termino);
  return clientes.map(c => ({
    ...c,
    descuento: calcularDescuentoPorPuntos(c.puntos || 0)
  }));
}

// Obtener cliente por ID
async function obtenerCliente(id) {
  const cliente = await clienteRepository.obtenerPorId(id);
  if (!cliente) throw new Error("Cliente no encontrado");
  return {
    ...cliente,
    descuento: calcularDescuentoPorPuntos(cliente.puntos || 0)
  };
}

// Registrar cliente
async function registrarCliente(data) {
  if (!data.nombre) throw new Error("El nombre es obligatorio");
  if (!data.telefono) throw new Error("El teléfono es obligatorio");

  const existe = await clienteRepository.buscarPorTelefono(data.telefono);
  if (existe) throw new Error("Ya existe un cliente con ese teléfono");

  const cliente = await clienteRepository.crear(data);
  return {
    ...cliente,
    descuento: calcularDescuentoPorPuntos(cliente.puntos || 0)
  };
}

// Actualizar cliente
async function actualizarCliente(id, data) {
  const cliente = await clienteRepository.obtenerPorId(id);
  if (!cliente) throw new Error("Cliente no encontrado");

  if (data.telefono && data.telefono !== cliente.telefono) {
    const existe = await clienteRepository.buscarPorTelefono(data.telefono);
    if (existe && existe.id_cliente !== parseInt(id)) {
      throw new Error("Ya existe un cliente con ese teléfono");
    }
  }

  const updated = await clienteRepository.actualizar(id, {
    nombre: data.nombre || cliente.nombre,
    telefono: data.telefono || cliente.telefono,
    puntos: data.puntos !== undefined ? data.puntos : cliente.puntos,
    estado: data.estado !== undefined ? data.estado : cliente.estado
  });

  return {
    ...updated,
    descuento: calcularDescuentoPorPuntos(updated.puntos || 0)
  };
}

// Sumar punto por compra
async function sumarPuntoPorCompra(id) {
  const cliente = await clienteRepository.obtenerPorId(id);
  if (!cliente) throw new Error("Cliente no encontrado");

  const updated = await clienteRepository.sumarPunto(id);
  return {
    ...updated,
    descuento: calcularDescuentoPorPuntos(updated.puntos || 0)
  };
}

// Cambiar estado
async function cambiarEstadoCliente(id, estado) {
  const cliente = await clienteRepository.obtenerPorId(id);
  if (!cliente) throw new Error("Cliente no encontrado");

  const updated = await clienteRepository.cambiarEstado(id, estado);
  return {
    ...updated,
    descuento: calcularDescuentoPorPuntos(updated.puntos || 0)
  };
}

// Eliminar cliente
async function eliminarCliente(id) {
  const cliente = await clienteRepository.obtenerPorId(id);
  if (!cliente) throw new Error("Cliente no encontrado");

  await clienteRepository.eliminar(id);
  return { success: true, message: "Cliente eliminado exitosamente" };
}

module.exports = {
  listarClientes,
  buscarClientes,
  obtenerCliente,
  registrarCliente,
  actualizarCliente,
  sumarPuntoPorCompra,
  cambiarEstadoCliente,
  eliminarCliente
};