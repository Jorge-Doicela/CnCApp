
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const capacitaciones = await prisma.capacitacion.findMany({
    where: {
      nombre: {
        contains: 'Jorge',
        mode: 'insensitive'
      }
    }
  });
  console.log('Capacitaciones found:', JSON.stringify(capacitaciones, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
