import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SEEDING ENCUESTA DE SATISFACCIÓN ---');

    // 1. Crear la capacitación si no existe
    const capacitacion = await prisma.capacitacion.upsert({
        where: { codigoQrEvento: 'ENC-RIOBAMBA-2026' },
        update: {},
        create: {
            nombre: 'Modelos de gestión de las competencias y funciones descentralizadas',
            descripcion: 'Capacitación sobre modelos de gestión y funciones descentralizadas en Riobamba.',
            lugar: 'Riobamba',
            fechaInicio: new Date('2026-04-16'),
            fechaFin: new Date('2026-04-16'),
            modalidad: 'Presencial',
            estado: 'Terminada',
            cuposDisponibles: 0,
            codigoQrEvento: 'ENC-RIOBAMBA-2026'
        }
    });

    console.log(`Capacitación creada/encontrada: ${capacitacion.id}`);

    // 2. Crear la encuesta vinculada
    const encuesta = await prisma.encuestaSatisfaction.upsert({
        where: { id: 1 }, // Usamos ID fijo para el ejemplo o buscamos por capacitacionId
        update: {
            titulo: 'Encuesta de satisfacción: Modelos de gestión de las competencias y funciones descentralizadas - Riobamba, 16 de abril de 2026',
            descripcion: 'El objetivo de ésta encuesta es conocer su opinión sobre el servicio recibido...'
        },
        create: {
            id: 1,
            capacitacionId: capacitacion.id,
            titulo: 'Encuesta de satisfacción: Modelos de gestión de las competencias y funciones descentralizadas - Riobamba, 16 de abril de 2026',
            descripcion: 'El objetivo de ésta encuesta es conocer su opinión sobre el servicio recibido...'
        }
    });

    console.log(`Encuesta creada/actualizada: ${encuesta.id}`);

    console.log('--- SEED COMPLETADO ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
