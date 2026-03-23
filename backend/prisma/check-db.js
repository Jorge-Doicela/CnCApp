const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
    console.log('--- DB Verification Script ---');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'NOT FOUND');
    
    const prisma = new PrismaClient();
    
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected.');

        const count = await prisma.institucionSistema.count({
            where: { tipo: 'PRIVADO' }
        });
        console.log(`Total private institutions in DB: ${count}`);

        const examples = await prisma.institucionSistema.findMany({
            where: { tipo: 'PRIVADO' },
            take: 5,
            select: { nombre: true }
        });
        console.log('Recent examples:');
        examples.forEach(e => console.log(` - ${e.nombre}`));

        // Check for EMELNORTE specifically
        const emelnorte = await prisma.institucionSistema.findFirst({
            where: { nombre: { contains: 'EMELNORTE' } }
        });
        console.log('EMELNORTE found:', emelnorte ? 'YES' : 'NO');

    } catch (e) {
        console.error('ERROR during verification:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
