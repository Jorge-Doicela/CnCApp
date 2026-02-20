
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const provincias = await prisma.provincia.count();
    const cantones = await prisma.canton.count();
    const parroquias = await prisma.parroquia.count();
    const usuarios = await prisma.usuario.count();
    const roles = await prisma.rol.count();

    console.log('--- Verification Results ---');
    console.log(`Provincias: ${provincias}`);
    console.log(`Cantones: ${cantones}`);
    console.log(`Parroquias: ${parroquias}`);
    console.log(`Usuarios: ${usuarios}`);
    console.log(`Roles: ${roles}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
