const prisma = require('../config/prismaClient');

async function crear(data) { return prisma.producto.create({ data, include: { categoria: true } }); }

async function listar() {
  return prisma.producto.findMany({ where: { estado: true }, include: { categoria: true } });
}

async function listarPorCategoria(id_categoria) {
  return prisma.producto.findMany({
    where: { id_categoria: Number(id_categoria), estado: true },
    include: { categoria: true },
  });
}

async function obtenerPorId(id) {
  return prisma.producto.findUnique({ where: { id_producto: Number(id) }, include: { categoria: true } });
}

async function buscarPorNombre(nombre) {
  return prisma.producto.findMany({
    where: { nombre: { contains: nombre, mode: 'insensitive' }, estado: true },
    include: { categoria: true },
  });
}

async function actualizar(id, data) {
  return prisma.producto.update({ where: { id_producto: Number(id) }, data, include: { categoria: true } });
}

async function eliminar(id) {
  return prisma.producto.update({ where: { id_producto: Number(id) }, data: { estado: false } });
}

async function stockBajo() {
  return prisma.$queryRaw`SELECT * FROM producto WHERE stock <= stock_minimo AND estado = true`;
}

module.exports = {
  crear, listar, listarPorCategoria, obtenerPorId,
  buscarPorNombre, actualizar, eliminar, stockBajo,
};