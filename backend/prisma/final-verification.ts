import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('--- FINAL INTEGRATION VERIFICATION ---');

  // 1. Provinces Check
  const provinces = await prisma.provincia.findMany({ orderBy: { nombre: 'asc' } });
  console.log(`Provinces count: ${provinces.length} (Expected: 24)`);
  const hasGalapagos = provinces.some(p => p.nombre === 'GALÁPAGOS');
  console.log(`Has GALÁPAGOS: ${hasGalapagos}`);

  if (hasGalapagos) {
    const galapagos = provinces.find(p => p.nombre === 'GALÁPAGOS');
    const cantons = await prisma.canton.findMany({ where: { provinciaId: galapagos?.id } });
    console.log(`Galápagos cantons: ${cantons.map(c => c.nombre).join(', ')}`);
  }

  // 2. Regimen Especial Check
  const regimenes = await prisma.regimenEspecial.findMany();
  console.log(`Regimen Especial count: ${regimenes.length}`);
  const hasGalapagosRegimen = regimenes.some(r => r.nombre === 'CONSEJO DE GOBIERNO DE RÉGIMEN ESPECIAL DE GALÁPAGOS');
  console.log(`Has Galápagos Regimen: ${hasGalapagosRegimen}`);

  // 3. Academia Check
  const academia = await prisma.institucionSistema.findMany({ where: { tipo: 'ACADEMIA' } });
  console.log(`Academia institutions: ${academia.length} (Expected: >50)`);
  const hasStanford = academia.some(i => i.nombre === 'INSTITUTO SUPERIOR UNIVERSITARIO STANFORD');
  console.log(`Has Stanford Institute: ${hasStanford}`);

  // 4. Ciudadanía Check
  const ciudadania = await prisma.institucionSistema.findMany({ where: { tipo: 'CIUDADANÍA' } });
  const hasCiudadanoParticular = ciudadania.some(i => i.nombre === 'CIUDADANO PARTICULAR');
  console.log(`Has CIUDADANO PARTICULAR: ${hasCiudadanoParticular}`);

  // 5. Users and IDs Check
  const users = await prisma.usuario.findMany({ select: { nombre: true, ci: true } });
  console.log(`Total users: ${users.length}`);

  console.log('--- VERIFICATION COMPLETE ---');
  await prisma.$disconnect();
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
