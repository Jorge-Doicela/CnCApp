import { PrismaClient } from '@prisma/client';

async function verify() {
  const prisma = new PrismaClient();
  try {
    console.log('--- Verifying Cargos ---');
    const cargos = await prisma.cargo.findMany({
      where: { nombre: { in: ['BOMBERO', 'POLICIA', 'VICEALCALDE', 'VICEPREFECTO'] } }
    });
    console.log(`Found ${cargos.length}/4 new cargos.`);
    cargos.forEach(c => console.log(` - ${c.nombre}`));

    console.log('\n--- Verifying Education ---');
    const edu = await prisma.educacionBasica.findMany({
      where: { nombre: { in: ['UNIDAD EDUCATIVA PIERRE DE COUBERTIN', 'PRESIDENTE JOSÉ LUIS TAMAYO'] } }
    });
    console.log(`Found ${edu.length}/2 sample education entities.`);

    console.log('\n--- Verifying Central Entities ---');
    const central = await prisma.institucionSistema.findMany({
      where: { nombre: { in: ['AGENCIA NACIONAL DE TRÁNSITO', 'BANCO CENTRAL DEL ECUADOR'] } }
    });
    console.log(`Found ${central.length}/2 sample central entities.`);

    console.log('\n--- Verifying Municipal Additions ---');
    const municipal = await prisma.institucionSistema.findMany({
      where: { nombre: { contains: 'JUNTA CANTONAL DE PROTECCIÓN DE DERECHOS' } },
      take: 5
    });
    console.log(`Found ${municipal.length} sample Juntas Cantonales.`);

    console.log('\n--- System Health Check ---');
    const userCount = await prisma.usuario.count();
    console.log(`Total users in system: ${userCount}`);
    
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
