const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const counts = await prisma.tipoInstitucion.count();
    console.log(`Successfully reached tipoInstitucion table. Record count: ${counts}`);
    const types = await prisma.tipoInstitucion.findMany();
    console.log('Sample types:', types.slice(0, 3));
  } catch (err) {
    console.error('Error accessing tipoInstitucion:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
