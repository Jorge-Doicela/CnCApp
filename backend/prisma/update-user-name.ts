import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserName() {
    console.log('🔄 Updating user display name...\n');

    try {
        const updated = await prisma.usuario.update({
            where: { ci: '0987654321' },
            data: { nombre: 'María López' }
        });

        console.log('✅ User updated successfully:');
        console.log(`   CI: ${updated.ci}`);
        console.log(`   Nombre: ${updated.nombre}`);
        console.log(`   Email: ${updated.email}`);
        console.log(`   Rol ID: ${updated.rolId}`);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateUserName();
