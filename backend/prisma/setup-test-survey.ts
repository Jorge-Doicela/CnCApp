import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- INSCRIBIENDO USUARIO DE PRUEBA ---');

    const user = await prisma.usuario.findFirst({
        where: { email: 'admin1@cnc.gob.ec' }
    });

    if (!user) {
        console.error('Usuario admin@cnc.gob.ec no encontrado');
        return;
    }

    const capacitacion = await prisma.capacitacion.findFirst({
        where: { codigoQrEvento: 'ENC-RIOBAMBA-2026' }
    });

    if (!capacitacion) {
        console.error('Capacitación Riobamba no encontrada');
        return;
    }

    // 1. Inscribir al usuario
    await prisma.usuarioCapacitacion.upsert({
        where: {
            usuarioId_capacitacionId: {
                usuarioId: user.id,
                capacitacionId: capacitacion.id
            }
        },
        update: { asistio: true },
        create: {
            usuarioId: user.id,
            capacitacionId: capacitacion.id,
            asistio: true,
            estadoInscripcion: 'Activa',
            rolCapacitacion: 'Participante'
        }
    });

    console.log(`Usuario ${user.email} inscrito y con asistencia marcada.`);

    // 2. Generar certificado de prueba
    await prisma.certificado.upsert({
        where: {
            usuario_capacitacion_unique: {
                usuarioId: user.id,
                capacitacionId: capacitacion.id
            }
        },
        update: {},
        create: {
            usuarioId: user.id,
            capacitacionId: capacitacion.id,
            codigoQR: `TEST-CERT-${Date.now()}`,
            pdfUrl: '/storage/certificados/test.pdf' // URL ficticia para que aparezca en el app
        }
    });

    console.log('Certificado de prueba generado. Ahora debería aparecer el botón de encuesta en la sección de Certificados.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
