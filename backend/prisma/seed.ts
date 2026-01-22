import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
    console.log('🌱 Starting database seed...');

    // Create roles
    console.log('Creating roles...');
    const adminRole = await prisma.rol.upsert({
        where: { nombre: 'Administrador' },
        update: {},
        create: {
            nombre: 'Administrador',
            descripcion: 'Administrador del sistema con acceso completo',
            modulos: ['usuarios', 'capacitaciones', 'certificados', 'reportes'],
        },
    });

    const coordinadorRole = await prisma.rol.upsert({
        where: { nombre: 'Coordinador' },
        update: {},
        create: {
            nombre: 'Coordinador',
            descripcion: 'Coordinador de capacitaciones',
            modulos: ['capacitaciones', 'certificados'],
        },
    });

    const participanteRole = await prisma.rol.upsert({
        where: { nombre: 'Participante' },
        update: {},
        create: {
            nombre: 'Participante',
            descripcion: 'Participante de capacitaciones',
            modulos: ['certificados'],
        },
    });

    console.log('✅ Roles created');

    // Create entity
    console.log('Creating entity...');
    const cncEntity = await prisma.entidad.upsert({
        where: { id: 1 },
        update: {},
        create: {
            nombre: 'Consejo Nacional de Competencias',
        },
    });

    console.log('✅ Entity created');

    // Create admin user
    console.log('Creating admin user...');
    const plainPassword = 'CncSecure2025!';
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    console.log('Password hash details:');
    console.log('- Plain password:', plainPassword);
    console.log('- Salt rounds:', SALT_ROUNDS);
    console.log('- Hash length:', hashedPassword.length);

    const adminUser = await prisma.usuario.upsert({
        where: { ci: '1234567890' },
        update: {
            password: hashedPassword,
        },
        create: {
            ci: '1234567890',
            nombre: 'Administrador CNC',
            email: 'admin@cnc.gob.ec',
            telefono: '0999999999',
            password: hashedPassword,
            rolId: adminRole.id,
            entidadId: cncEntity.id,
            tipoParticipante: 0,
        },
    });

    console.log('✅ Admin user created');

    // Verify password immediately
    console.log('\n🔍 Verifying password...');
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Password verification result:', isValid ? '✅ VALID' : '❌ INVALID');

    if (!isValid) {
        throw new Error('Password verification failed immediately after creation!');
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('CI:', adminUser.ci);
    console.log('Password:', plainPassword);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
