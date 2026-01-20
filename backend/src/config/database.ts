import { PrismaClient } from '@prisma/client';

// Crear instancia de Prisma
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Manejar cierre graceful
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;
