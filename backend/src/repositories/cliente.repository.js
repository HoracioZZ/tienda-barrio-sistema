// src/repositories/cliente.repository.js
const prisma = require("../config/prismaClient");

class ClienteRepository {
  // Crear cliente
  async crear(data) {
    const { nombre, telefono } = data;
    return await prisma.cliente.create({
      data: {
        nombre,
        telefono,
        puntos: 0,
        numero_compras: 0,
        estado: true
      }
    });
  }

  // Obtener cliente por ID
  async obtenerPorId(id) {
    return await prisma.cliente.findUnique({
      where: { id_cliente: parseInt(id) }
    });
  }

  // Listar todos los clientes
  async listar() {
    return await prisma.cliente.findMany({
      orderBy: { nombre: 'asc' }
    });
  }

  // Listar clientes activos
  async listarActivos() {
    return await prisma.cliente.findMany({
      where: { estado: true },
      orderBy: { nombre: 'asc' }
    });
  }

  // Actualizar cliente (sin descuento)
  async actualizar(id, data) {
    const { nombre, telefono, puntos, estado } = data;
    return await prisma.cliente.update({
      where: { id_cliente: parseInt(id) },
      data: {
        nombre,
        telefono,
        puntos,
        estado
      }
    });
  }

  // Sumar punto por compra
  async sumarPunto(id) {
    const cliente = await this.obtenerPorId(id);
    if (!cliente) throw new Error("Cliente no encontrado");

    const nuevosPuntos = (cliente.puntos || 0) + 1;

    return await prisma.cliente.update({
      where: { id_cliente: parseInt(id) },
      data: {
        puntos: nuevosPuntos,
        numero_compras: (cliente.numero_compras || 0) + 1
      }
    });
  }

  // Cambiar estado
  async cambiarEstado(id, estado) {
    return await prisma.cliente.update({
      where: { id_cliente: parseInt(id) },
      data: { estado }
    });
  }

  // Eliminar cliente (lógico)
  async eliminar(id) {
    return await prisma.cliente.update({
      where: { id_cliente: parseInt(id) },
      data: { estado: false }
    });
  }

  // Buscar por teléfono
  async buscarPorTelefono(telefono) {
    return await prisma.cliente.findFirst({
      where: { telefono }
    });
  }

  // Buscar por término
  async buscar(termino) {
    return await prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: termino, mode: 'insensitive' } },
          { telefono: { contains: termino, mode: 'insensitive' } }
        ]
      },
      orderBy: { nombre: 'asc' }
    });
  }

  // ✅ Función para calcular descuento (NO se guarda en DB)
  calcularDescuentoPorPuntos(puntos) {
    if (puntos >= 100) return 20;
    if (puntos >= 50) return 10;
    if (puntos >= 20) return 5;
    return 0;
  }
}

module.exports = new ClienteRepository();