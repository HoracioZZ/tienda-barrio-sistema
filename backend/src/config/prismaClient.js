const { PrismaClient } = require('@prisma/client');

// Patron singleton: una sola instancia de conexion a la BD para toda la app
const prisma = new PrismaClient();

module.exports = prisma;
