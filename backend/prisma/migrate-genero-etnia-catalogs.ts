/**
 * Migración segura de catálogos género / etnia (producción o tras cambiar nombres).
 * Reasigna id_genero / id_etnia en usuarios y elimina filas legadas sin referencias.
 *
 * Uso: npm run prisma:migrate:genero-etnia
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { syncGeneroEtniaCatalogs } from './seed-sync-genero-etnia';

const prisma = new PrismaClient();

async function main() {
    console.log('Sincronizando catálogos género y etnia...');
    await syncGeneroEtniaCatalogs(prisma, { verbose: true });
    console.log('Listo.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
