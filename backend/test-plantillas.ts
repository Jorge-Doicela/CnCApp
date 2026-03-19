import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const plantillas = await prisma.plantilla.findMany();
  console.log('--- PLANTILLAS IN DB ---');
  console.log(JSON.stringify(plantillas, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
