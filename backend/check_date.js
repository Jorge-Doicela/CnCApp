const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.usuario.findFirst({
        where: { fechaNacimiento: { not: null } },
        select: { correo: true, fechaNacimiento: true }
    });
    console.log('User:', user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
