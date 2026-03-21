import { PrismaClient } from '@prisma/client';
import { seedGeoSqlProvincias } from './seed-reference-catalogs';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning geo tables (Parroquias/Cantones/Provincias)...');
    await prisma.parroquia.deleteMany();
    await prisma.canton.deleteMany();
    await prisma.provincia.deleteMany();

    console.log('Seeding provincias/cantones/parroquias (23 provincias SQL)...');
    await seedGeoSqlProvincias(prisma);

    console.log('Geo seeding completed.');
}

main()
    .catch((e) => {
        console.error('Geo seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
