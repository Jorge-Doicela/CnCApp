import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateRoleNames() {
    console.log('🔄 Updating role names...');

    try {
        // Update role ID 2 (Coordinador -> Conferencista)
        const conferencistaUpdate = await prisma.rol.update({
            where: { id: 2 },
            data: {
                nombre: 'Conferencista',
                descripcion: 'Creador de conferencias con capacidad de gestionar capacitaciones y generar certificados',
                modulos: ['capacitaciones', 'certificados', 'inscripciones'],
            },
        });
        console.log(` Updated role ID 2 to 'Conferencista'`);

        // Update role ID 3 (Participante -> Usuario)
        const usuarioUpdate = await prisma.rol.update({
            where: { id: 3 },
            data: {
                nombre: 'Usuario',
                descripcion: 'Usuario del sistema que puede crear cuenta, editar datos, visualizar capacitaciones y descargar certificados',
                modulos: ['perfil', 'capacitaciones-lectura', 'certificados-propios'],
            },
        });
        console.log(` Updated role ID 3 to 'Usuario'`);

        // Verify changes
        const roles = await prisma.rol.findMany({
            orderBy: { id: 'asc' }
        });

        console.log('\n📋 Current roles in database:');
        roles.forEach(role => {
            console.log(`  ${role.id}. ${role.nombre} - ${role.descripcion}`);
            console.log(`     Módulos: ${role.modulos.join(', ')}`);
        });

        console.log('\n Role names updated successfully!');
    } catch (error) {
        console.error('❌ Error updating roles:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

updateRoleNames();
