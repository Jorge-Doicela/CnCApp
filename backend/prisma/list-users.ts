import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.usuario.findMany({
        take: 5,
        select: { email: true, nombre: true }
    });
    console.log('Usuarios en la base:', users);
}

main().finally(() => prisma.$disconnect());
