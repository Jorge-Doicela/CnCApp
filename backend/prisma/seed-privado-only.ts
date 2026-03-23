import { PrismaClient } from '@prisma/client';
import { privadoList } from './data/form-options-academia-privado';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Targeted Private Sector Seed ---');
    
    // Find or create the PRIVADO tipoInstitucion
    const tipoPrivado = await prisma.tipoInstitucion.upsert({
        where: { nombre: 'PRIVADO' },
        update: {},
        create: { nombre: 'PRIVADO' }
    });

    console.log(`Using tipoInstitucionId: ${tipoPrivado.id}`);

    const data = privadoList.map(nombre => ({
        nombre,
        tipo: 'PRIVADO',
        tipoInstitucionId: tipoPrivado.id
    }));

    console.log(`Attempting to upsert ${data.length} private entities...`);

    // Use a loop to avoid large batch timeouts and see progress
    for (const item of data) {
        try {
            await prisma.institucionSistema.upsert({
                where: { nombre: item.nombre },
                update: {
                    tipo: item.tipo,
                    tipoInstitucionId: item.tipoInstitucionId
                },
                create: item
            });
            // console.log(`✓ ${item.nombre}`);
        } catch (e: any) {
            console.error(`✗ Error seeding ${item.nombre}: ${e.message}`);
        }
    }

    console.log('--- Seed Finished ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
