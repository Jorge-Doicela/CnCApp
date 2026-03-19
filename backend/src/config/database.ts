import { PrismaClient } from '@prisma/client';

// Crear instancia de Prisma
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Verifica la conexión a la base de datos con reintentos.
 * Esto ayuda a manejar problemas de red temporales al iniciar el servidor.
 */
export const checkDatabaseConnection = async (retries = 5, delay = 2000): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$connect();
            console.log('✅ [Database] Conexión establecida correctamente');
            return true;
        } catch (error) {
            console.error(`❌ [Database] Intento de conexión ${i + 1}/${retries} fallido:`, (error as Error).message);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    return false;
};

// Manejar cierre graceful
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;
