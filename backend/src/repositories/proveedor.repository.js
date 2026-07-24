const prisma = require("../config/prismaClient");

async function listarActivos() {
  return prisma.proveedor.findMany({
    where: { estado: true },
    orderBy: { nombre: "asc" },
  });
}

module.exports = { listarActivos };