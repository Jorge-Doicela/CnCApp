const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoles() {
    try {
        const roles = await prisma.rol.findMany();
        console.log('Roles found:', roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRoles();
