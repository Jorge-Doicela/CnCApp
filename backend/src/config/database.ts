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
            // Pequeña espera para confirmar que el socket no se cierra de inmediato
            await new Promise(resolve => setTimeout(resolve, 500));
            await prisma.$queryRaw`SELECT 1`;
            console.log('✅ [Database] Conexión establecida y verificada correctamente');
            return true;
        } catch (error) {
            const errorMsg = (error as Error).message;
            console.error(`❌ [Database] Intento de conexión ${i + 1}/${retries} fallido:`, errorMsg);
            
            // Si es un error de conexión reiniciada, desconectar y reintentar
            await prisma.$disconnect().catch(() => {});
            
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
