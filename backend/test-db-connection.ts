import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function test() {
    try {
        console.log('DATABASE_URL:', process.env.DATABASE_URL);
        console.log('Attempting to connect...');

        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Connection successful!', result);

        const roles = await prisma.rol.findMany();
        console.log('✅ Found roles:', roles.length);
    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
