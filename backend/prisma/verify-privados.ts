import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function verify() {
  let output = '';
  try {
    const totalPrivados = await prisma.institucionSistema.count({
      where: { tipo: 'PRIVADO' }
    });
    output += `Total instituciones PRIVADO: ${totalPrivados}\n`;

    const sample = await prisma.institucionSistema.findFirst({
      where: { nombre: 'EMELNORTE S. A.' }
    });
    output += `Búsqueda de 'EMELNORTE S. A.': ${sample ? 'ENCONTRADO' : 'NO ENCONTRADO'}\n`;

    const particular = await prisma.institucionSistema.findFirst({
      where: { nombre: 'PARTICULAR' }
    });
    output += `Búsqueda de 'PARTICULAR': ${particular ? 'ENCONTRADO' : 'NO ENCONTRADO'}\n`;

    const allPrivados = await prisma.institucionSistema.findMany({
      where: { tipo: 'PRIVADO' },
      select: { nombre: true }
    });
    output += 'Listado de PRIVADOS:\n' + JSON.stringify(allPrivados.map(p => p.nombre), null, 2) + '\n';

  } catch (error: any) {
    output += `Error en verificación: ${error.message}\n`;
  } finally {
    fs.writeFileSync('prisma_verify_result.txt', output);
    await prisma.$disconnect();
  }
}

verify();
