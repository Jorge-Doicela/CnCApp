import { PrismaClient } from '@prisma/client';
import { validateEcuadorianID } from './prisma/tools/ecuador-id.utils';

const prisma = new PrismaClient();

async function verifySeed() {
  try {
    const users = await prisma.usuario.findMany({
      include: { rol: true }
    });
    
    console.log(`Total users: ${users.length}`);
    users.forEach(u => {
      const isValid = validateEcuadorianID(u.ci);
      console.log(`User: ${u.nombre}, Email: ${u.email}, CI: ${u.ci}, Role: ${u.rol.nombre}, Valid CI: ${isValid}`);
    });
    
    const trainings = await prisma.capacitacion.findMany();
    console.log(`Total trainings: ${trainings.length}`);
    trainings.forEach(t => {
      console.log(`Training: ${t.nombre}, State: ${t.estado}`);
    });

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeed();
