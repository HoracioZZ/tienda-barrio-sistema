const prisma = require('../config/prismaClient');

async function crear(data) { return prisma.producto.create({ data }); }
async function listar() { return prisma.producto.findMany({ include: { categoria: true } }); }
async function buscarPorNombre(nombre) {
  return prisma.producto.findMany({ where: { nombre: { contains: nombre, mode: 'insensitive' } } });
}
async function stockBajo() {
  return prisma.$queryRaw`SELECT * FROM producto WHERE stock <= stock_minimo`;
}

module.exports = { crear, listar, buscarPorNombre, stockBajo };
