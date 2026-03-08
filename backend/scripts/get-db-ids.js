const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    const roles = await prisma.rol.findMany();
    const tipos = await prisma.tipoParticipante.findMany();
    const entidades = await prisma.entidad.findMany();

    const output = {
        roles: roles.map(r => ({ id: r.id, nombre: r.nombre })),
        tipos: tipos.map(t => ({ id: t.id, nombre: t.nombre })),
        entidades: entidades.map(e => ({ id: e.id, nombre: e.nombre }))
    };
    fs.writeFileSync('db-output.json', JSON.stringify(output, null, 2));
}

main().finally(() => prisma.$disconnect());
