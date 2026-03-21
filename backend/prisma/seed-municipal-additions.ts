import { PrismaClient } from '@prisma/client';
import { ensureMunicipalInstitucionesSistema } from './seed-reference-catalogs';

const prisma = new PrismaClient();

async function main() {
    await ensureMunicipalInstitucionesSistema(prisma);
    console.log('Municipal additions seed completed.');
}

main()
    .catch((e) => {
        console.error('Municipal additions seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
