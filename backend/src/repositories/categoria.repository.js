const prisma = require("../config/prismaClient");

async function crear(data) {
  return prisma.categoria.create({ data });
}

// listar con opción de incluir inactivas
async function listar(mostrarInactivas = false) {
  const where = mostrarInactivas ? {} : { estado: true };
  return prisma.categoria.findMany({ where });
}

async function obtenerPorId(id) {
  return prisma.categoria.findUnique({ where: { id_categoria: Number(id) } });
}

async function obtenerPorNombre(nombre) {
  return prisma.categoria.findFirst({ where: { nombre: nombre.trim() } });
}

async function actualizar(id, data) {
  return prisma.categoria.update({ where: { id_categoria: Number(id) }, data });
}

async function eliminar(id) {
  return prisma.categoria.update({
    where: { id_categoria: Number(id) },
    data: { estado: false },
  });
}

async function reactivar(id) {
  return prisma.categoria.update({
    where: { id_categoria: Number(id) },
    data: { estado: true },
  });
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  obtenerPorNombre,
  actualizar,
  eliminar,
  reactivar,
};
