const clienteRepository = require("../repositories/cliente.repository");

function calcularDescuento(puntos) {
  if (puntos >= 100) return 20;
  if (puntos >= 50) return 10;
  if (puntos >= 20) return 5;
  return 0;
}

function calcularPuntosPorCompras(cantidadCompras) {
  if (cantidadCompras >= 40) return 25;
  if (cantidadCompras >= 20) return 10;
  return 0;
}

// RF-12: registrar cliente frecuente
async function registrarCliente(data) {
  if (!data.nombre) throw new Error("El nombre es obligatorio");
  const cliente = await clienteRepository.crear({
    ...data,
    numero_compras: data.numero_compras || 0,
    puntos: 0
  });
  return {
    ...cliente,
    descuento: calcularDescuento(cliente.puntos)
  };
}

// RF-13: asignar puntos según compras
async function asignarPuntos(id_cliente, cantidadCompras) {
  if (cantidadCompras < 0) throw new Error("Las compras no pueden ser negativas");

  const puntosGanados = calcularPuntosPorCompras(cantidadCompras);

  const cliente = await clienteRepository.actualizarPuntos(id_cliente, puntosGanados);

  return {
    ...cliente,
    descuento: calcularDescuento(cliente.puntos)
  };
}

async function listarClientes() {
  const clientes = await clienteRepository.listar();
  return clientes.map(c => ({
    ...c,
    descuento: calcularDescuento(c.puntos)
  }));
}

module.exports = { registrarCliente, listarClientes, asignarPuntos };
