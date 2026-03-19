const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plantillas = await prisma.plantilla.findMany();
  console.log(JSON.stringify(plantillas, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
