import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    try {
        const deleted = await prisma.usuario.deleteMany({
            where: { ci: '0987654321' }
        });
        console.log(`Deleted ${deleted.count} test users.`);
    } catch (error) {
        console.error('Error cleaning up:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
