import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.usuario.findFirst({
    where: {
      OR: [
        { email: 'admin1@cnc.gob.ec' },
        { ci: '1710000001' }
      ]
    },
    include: {
        rol: true
    }
  });

  if (user) {
    console.log('--- USUARIO ENCONTRADO ---');
    console.log(`Nombre: ${user.nombre}`);
    console.log(`Email: ${user.email}`);
    console.log(`CI: ${user.ci}`);
    console.log(`Rol: ${user.rol?.nombre} (ID: ${user.rolId})`);
    console.log(`Estado: ${user.estado}`);
    console.log(`Password Hash: ${user.password?.substring(0, 10)}...`);
  } else {
    console.log('--- USUARIO NO ENCONTRADO ---');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
