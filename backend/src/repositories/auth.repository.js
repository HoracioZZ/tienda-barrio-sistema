const prisma = require('../config/prismaClient');

async function buscarPorLogin(login) {
  return prisma.usuario.findUnique({ where: { login } });
}

async function crearUsuario(data) {
  return prisma.usuario.create({ data });
}

module.exports = { buscarPorLogin, crearUsuario };
