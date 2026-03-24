const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const cap = await prisma.capacitacion.findFirst({
        where: { nombre: { contains: 'Prueba', mode: 'insensitive' } },
        include: {
        inscripciones: {
            include: { usuario: true }
        },
        certificados: true
        }
    });

    if (!cap) {
        console.log('CAPACITACION "Prueba" NO ENCONTRADA');
        return;
    }

    console.log('--- CAPACITACION ---');
    console.log('ID:', cap.id);
    console.log('Nombre:', cap.nombre);
    console.log('Estado:', cap.estado);
    console.log('Certificado (flag):', cap.certificado);
    console.log('Plantilla ID:', cap.plantillaId);
    console.log('Inscripciones count:', cap.inscripciones.length);
    console.log('Certificados count:', cap.certificados.length);

    const fabian = cap.inscripciones.find(i => 
        (i.usuario && i.usuario.nombre && i.usuario.nombre.includes('Fabián')) || 
        (i.usuario && i.usuario.ci === '0104618721')
    );

    if (fabian) {
        console.log('--- FABIAN ---');
        console.log('ID Inscripcion:', fabian.id);
        console.log('Asistio:', fabian.asistio);
        const cert = cap.certificados.find(c => c.usuarioId === fabian.usuarioId);
        console.log('Certificado existe en DB:', !!cert);
        if (cert) console.log('Certificado URL:', cert.pdfUrl);
    } else {
        console.log('FABIAN NO ENCONTRADO EN ESTA CAPACITACION');
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
