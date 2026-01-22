import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRoles() {
    const roles = await prisma.rol.findMany({
        orderBy: { id: 'asc' }
    });

    console.log('Roles disponibles:');
    roles.forEach(role => {
        console.log(`- ID: ${role.id}, Nombre: ${role.nombre}`);
    });

    await prisma.$disconnect();
}

checkRoles();
