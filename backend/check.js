const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const tipos = await prisma.tipoParticipante.findMany();
    console.log('Tipos:', tipos.map(t => `${t.id}=${t.codigo}`));
    const enti = await prisma.entidad.findMany();
    console.log('Entidades:', enti.map(e => `${e.id}=${e.codigo}`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
