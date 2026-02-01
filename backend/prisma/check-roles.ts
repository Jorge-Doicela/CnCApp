import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRoles() {
    console.log('📋 Checking current roles in database...\n');

    try {
        const roles = await prisma.rol.findMany({
            orderBy: { id: 'asc' }
        });

        console.log(`Found ${roles.length} role(s):\n`);
        roles.forEach(role => {
            console.log(`ID: ${role.id}`);
            console.log(`Nombre: ${role.nombre}`);
            console.log(`Descripción: ${role.descripcion}`);
            console.log(`Módulos: ${Array.isArray(role.modulos) ? role.modulos.join(', ') : role.modulos}`);
            console.log('---');
        });
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRoles();
