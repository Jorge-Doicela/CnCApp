
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const roles = await prisma.rol.findMany();
    console.log('--- ROLES ---');
    roles.forEach(r => console.log(`ID: ${r.id}, Name: ${r.nombre}`));

    const users = await prisma.usuario.findMany({
        take: 5,
        select: { id: true, email: true, rolId: true }
    });
    console.log('\n--- USERS (First 5) ---');
    users.forEach(u => console.log(`User: ${u.email}, Role ID: ${u.rolId}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
