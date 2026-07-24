const prisma = require('../config/prismaClient');

async function crear(data) {
  return prisma.categoria.create({ data });
}

async function listar() {
  return prisma.categoria.findMany({ where: { estado: true } });
}

async function obtenerPorId(id) {
  return prisma.categoria.findUnique({ where: { id_categoria: Number(id) } });
}

async function actualizar(id, data) {
  return prisma.categoria.update({ where: { id_categoria: Number(id) }, data });
}

async function eliminar(id) {
  return prisma.categoria.update({ where: { id_categoria: Number(id) }, data: { estado: false } });
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar };