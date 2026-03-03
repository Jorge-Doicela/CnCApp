import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const grados = [
    'PROFESIONAL 1', 'PROFESIONAL 2', 'PROFESIONAL 3', 'PROFESIONAL 4', 'PROFESIONAL 5', 'PROFESIONAL 6',
    'TÉCNICO A', 'TÉCNICO B', 'TÉCNICO C',
    'SERVIDOR PÚBLICO 1', 'SERVIDOR PÚBLICO 2', 'SERVIDOR PÚBLICO 3', 'SERVIDOR PÚBLICO 4',
    'SERVIDOR PÚBLICO 5', 'SERVIDOR PÚBLICO 6', 'SERVIDOR PÚBLICO 7',
];

try {
    const count = await p.gradoOcupacional.count();
    if (count === 0) {
        await p.gradoOcupacional.createMany({ data: grados.map(nombre => ({ nombre })) });
        console.log('✔ Grados Ocupacionales seeded:', grados.length);
    } else {
        console.log('Already seeded:', count, 'rows');
    }
} finally {
    await p.$disconnect();
}
