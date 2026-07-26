const prisma = require('../config/prismaClient');

async function crear(data) {
  return prisma.alerta.create({ data, include: { producto: true, usuario: true } });
}

async function listar() {
  return prisma.alerta.findMany({
    include: { producto: true, usuario: true },
    orderBy: { fecha_generacion: 'desc' },
  });
}

async function listarPorUsuario(id_usuario) {
  return prisma.alerta.findMany({
    where: { id_usuario: Number(id_usuario) },
    include: { producto: true },
    orderBy: { fecha_generacion: 'desc' },
  });
}

 
async function existeAlertaReciente(id_producto, tipo) {
  const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const alerta = await prisma.alerta.findFirst({
    where: { id_producto: Number(id_producto), tipo, fecha_generacion: { gte: hace24h } },
  });
  return !!alerta;
}

async function administradoresActivos() {
  return prisma.usuario.findMany({ where: { rol: 'Administrador', estado: true } });
}
async function eliminarPorProducto(id_producto) {
  return prisma.alerta.deleteMany({ where: { id_producto: Number(id_producto) } });
}
module.exports = {
  crear, listar, listarPorUsuario, existeAlertaReciente,
  administradoresActivos, eliminarPorProducto,
};