import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        const count = await prisma.usuario.count();
        console.log('✅ Conexión exitosa! Usuarios en BD:', count);

        const users = await prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                ci: true
            }
        });

        console.log('Usuarios:', users);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
