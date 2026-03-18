const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting module names migration (CJS)...');
    const systemModules = [
        "Ver Perfil", "Ver conferencias", "Gestionar roles", "Gestionar capacitaciones",
        "Gestionar usuarios", "Gestionar entidades", "Gestionar provincias",
        "Gestionar parroquias", "Gestionar cantones", "Gestionar competencias",
        "Gestionar instituciones", "Validar certificados"
    ];

    const adminRole = await prisma.rol.findUnique({ where: { nombre: 'Administrador' } });
    if (adminRole) {
        await prisma.rol.update({
            where: { id: adminRole.id },
            data: { modulos: systemModules }
        });
        console.log('✅ Admin role updated.');
    }

    const conferencistaRole = await prisma.rol.findUnique({ where: { nombre: 'Conferencista' } });
    if (conferencistaRole) {
        await prisma.rol.update({
            where: { id: conferencistaRole.id },
            data: { modulos: ["Ver Perfil", "Ver conferencias", "Gestionar capacitaciones", "Validar certificados"] }
        });
        console.log('✅ Conferencista role updated.');
    }

    const usuarioRole = await prisma.rol.findUnique({ where: { nombre: 'Usuario' } });
    if (usuarioRole) {
        await prisma.rol.update({
            where: { id: usuarioRole.id },
            data: { modulos: ["Ver Perfil", "Ver conferencias"] }
        });
        console.log('✅ Usuario role updated.');
    }
    console.log('🎉 Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
