import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting module names migration...');

    const systemModules = [
        "Ver Perfil",
        "Ver conferencias",
        "Gestionar roles",
        "Gestionar capacitaciones",
        "Gestionar usuarios",
        "Gestionar entidades",
        "Gestionar provincias",
        "Gestionar parroquias",
        "Gestionar cantones",
        "Gestionar competencias",
        "Gestionar instituciones",
        "Gestionar plantillas",
        "Gestionar reportes",
        "Gestionar grados ocupacionales",
        "Gestionar cargos",
        "Validar certificados"
    ];

    // 1. Update Administrator Role
    const adminRole = await prisma.rol.findUnique({ where: { nombre: 'Administrador' } });
    if (adminRole) {
        console.log('Updating Administrator role modules...');
        await prisma.rol.update({
            where: { id: adminRole.id },
            data: {
                modulos: systemModules // Admin gets everything
            }
        });
        console.log('✅ Administrator role updated.');
    } else {
        console.error('❌ Administrator role not found.');
    }

    // 2. Update Conferencista Role
    const conferencistaRole = await prisma.rol.findUnique({ where: { nombre: 'Conferencista' } });
    if (conferencistaRole) {
        console.log('Updating Conferencista role modules...');
        await prisma.rol.update({
            where: { id: conferencistaRole.id },
            data: {
                modulos: ["Ver Perfil", "Ver conferencias", "Gestionar capacitaciones", "Gestionar plantillas", "Validar certificados"]
            }
        });
        console.log('✅ Conferencista role updated.');
    }

    // 3. Update Usuario Role
    const usuarioRole = await prisma.rol.findUnique({ where: { nombre: 'Usuario' } });
    if (usuarioRole) {
        console.log('Updating Usuario role modules...');
        await prisma.rol.update({
            where: { id: usuarioRole.id },
            data: {
                modulos: ["Ver Perfil", "Ver conferencias"]
            }
        });
        console.log('✅ Usuario role updated.');
    }

    console.log('🎉 Migration completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
