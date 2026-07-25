const prisma = require("../config/prismaClient");

async function listarActivos() {
  return prisma.proveedor.findMany({
    where: { estado: true },
    orderBy: { nombre: "asc" },
  });
}

async function crear(data) {
  return prisma.proveedor.create({ data });
}

module.exports = { listarActivos, crear };