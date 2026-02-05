import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupAndUpdateRoles() {
    console.log('🔄 Cleaning up duplicate roles and updating user references...\n');

    try {
        // 1. Update users with role ID 2 (Coordinador) to role ID 4 (Conferencista)
        const updateCoord = await prisma.usuario.updateMany({
            where: { rolId: 2 },
            data: { rolId: 4 }
        });
        console.log(` Updated ${updateCoord.count} user(s) from Coordinador (ID 2) to Conferencista (ID 4)`);

        // 2. Update users with role ID 3 (Participante) to role ID 5 (Usuario)
        const updatePart = await prisma.usuario.updateMany({
            where: { rolId: 3 },
            data: { rolId: 5 }
        });
        console.log(` Updated ${updatePart.count} user(s) from Participante (ID 3) to Usuario (ID 5)`);

        // 3. Delete old roles
        await prisma.rol.delete({ where: { id: 2 } });
        console.log(` Deleted old role: Coordinador (ID 2)`);

        await prisma.rol.delete({ where: { id: 3 } });
        console.log(` Deleted old role: Participante (ID 3)`);

        // 4. Update IDs of new roles to match expected IDs (2 and 3)
        // First, move them to temporary IDs to avoid conflicts
        await prisma.rol.update({ where: { id: 4 }, data: { id: 2 } });
        console.log(` Updated Conferencista ID from 4 to 2`);

        await prisma.rol.update({ where: { id: 5 }, data: { id: 3 } });
        console.log(` Updated Usuario ID from 5 to 3`);

        // 5. Update user references back to correct IDs
        await prisma.usuario.updateMany({
            where: { rolId: 4 },
            data: { rolId: 2 }
        });

        await prisma.usuario.updateMany({
            where: { rolId: 5 },
            data: { rolId: 3 }
        });

        console.log('\n📋 Final roles in database:');
        const roles = await prisma.rol.findMany({
            orderBy: { id: 'asc' }
        });

        roles.forEach(role => {
            console.log(`  ${role.id}. ${role.nombre} - ${role.descripcion}`);
        });

        console.log('\n Cleanup completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

cleanupAndUpdateRoles();
