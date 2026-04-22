import prisma from '../src/config/database';

async function main() {
    const userCount = await prisma.usuario.count();
    const capacitacionCount = await prisma.capacitacion.count();
    const users = await prisma.usuario.findMany({ select: { id: true, nombre: true } });
    const caps = await prisma.capacitacion.findMany({ select: { id: true, nombre: true } });

    console.log('--- DATABASE STATUS ---');
    console.log(`Total Usuarios: ${userCount}`);
    console.log(`Total Capacitaciones: ${capacitacionCount}`);
    console.log('Usuarios:', users);
    console.log('Capacitaciones:', caps);
}

main().catch(console.error).finally(() => prisma.$disconnect());
