const prisma = require('../config/prismaClient');

async function crear(data) { return prisma.cliente.create({ data }); }
async function listar() { return prisma.cliente.findMany(); }
async function actualizarPuntos(id_cliente, puntos) {
  return prisma.cliente.update({ where: { id_cliente }, data: { puntos } });
}

module.exports = { crear, listar, actualizarPuntos };
