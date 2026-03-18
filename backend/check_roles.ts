import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DEBUG: USUARIOS Y ROLES ---');
  const users = await prisma.usuario.findMany({
    include: {
      rol: true
    }
  });

  users.forEach(u => {
    console.log(`User ID: ${u.id}, Name: ${u.nombre}, CI: ${u.ci}, Role: ${u.rol?.nombre}, Modules: ${JSON.stringify(u.rol?.modulos)}`);
  });

  console.log('--- DEBUG: ROLES DISPONIBLES ---');
  const roles = await prisma.rol.findMany();
  roles.forEach(r => {
    console.log(`Role ID: ${r.id}, Name: ${r.nombre}, Modules: ${JSON.stringify(r.modulos)}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
