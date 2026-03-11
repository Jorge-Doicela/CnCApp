import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.usuario.findMany({
    select: { id: true, email: true, nombre: true }
  });
  console.log('--- USERS IN DB ---');
  console.log(JSON.stringify(users, null, 2));

  const caps = await prisma.capacitacion.findMany({
    select: { id: true, nombre: true }
  });
  console.log('--- CAPACITACIONES IN DB ---');
  console.log(JSON.stringify(caps, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
