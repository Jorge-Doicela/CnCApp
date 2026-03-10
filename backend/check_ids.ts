
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function checkIds() {
  let output = '';
  try {
    const tipos = await prisma.tipoParticipante.findMany();
    output += 'TIPOS DE PARTICIPANTE:\n' + JSON.stringify(tipos, null, 2) + '\n\n';

    const entidades = await prisma.entidad.findMany();
    output += 'ENTIDADES (NIVELES DE GOBIERNO):\n' + JSON.stringify(entidades, null, 2) + '\n\n';

    const roles = await prisma.rol.findMany();
    output += 'ROLES:\n' + JSON.stringify(roles, null, 2) + '\n';

    fs.writeFileSync('ids_dump.txt', output);
    console.log('Dump correct');
  } catch (e) {
    fs.writeFileSync('ids_dump_error.txt', JSON.stringify(e, null, 2));
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkIds();
