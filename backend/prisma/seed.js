const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const contrasenaAdmin = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      nombre: 'Administradora',
      login: 'admin',
      contrasena: contrasenaAdmin,
      rol: 'Administrador',
      estado: true,
    },
  });

  const contrasenaVendedor = await bcrypt.hash('vendedor123', 10);

  const vendedor = await prisma.usuario.upsert({
    where: { login: 'vendedor' },
    update: {},
    create: {
      nombre: 'Juan (Vendedor)',
      login: 'vendedor',
      contrasena: contrasenaVendedor,
      rol: 'Vendedor',
      estado: true,
    },
  });

  console.log('Usuario administrador creado/verificado:', admin.login);
  console.log('Usuario vendedor creado/verificado:', vendedor.login);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });