import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
    console.log('🌱 Starting database seed...');

    try {
        // 1. Create roles
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

        const conferencistaRole = await prisma.rol.upsert({
            where: { nombre: 'Conferencista' },
            update: {},
            create: {
                nombre: 'Conferencista',
                descripcion: 'Creador de conferencias con capacidad de gestionar capacitaciones y generar certificados',
                modulos: ['capacitaciones', 'certificados', 'inscripciones'],
            },
        });

        const usuarioRole = await prisma.rol.upsert({
            where: { nombre: 'Usuario' },
            update: {},
            create: {
                nombre: 'Usuario',
                descripcion: 'Usuario del sistema que puede crear cuenta, editar datos, visualizar capacitaciones y descargar certificados',
                modulos: ['perfil', 'capacitaciones-lectura', 'certificados-propios'],
            },
        });

        console.log('✅ Roles created');

        // 2. Create entities
        console.log('Creating entities...');
        const cncEntity = await prisma.entidad.upsert({
            where: { id: 1 },
            update: { nombre: 'Consejo Nacional de Competencias' },
            create: {
                id: 1,
                nombre: 'Consejo Nacional de Competencias',
            },
        });

        const gadEntity = await prisma.entidad.upsert({
            where: { id: 2 },
            update: { nombre: 'GAD Municipal de Quito' },
            create: {
                id: 2,
                nombre: 'GAD Municipal de Quito',
            },
        });

        console.log('✅ Entities created');

        // 3. Create users
        console.log('Creating users...');
        const plainPassword = 'CncSecure2025!';
        const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

        // Admin
        const adminUser = await prisma.usuario.upsert({
            where: { ci: '1234567890' },
            update: { password: hashedPassword },
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

        // Conferencista
        const coordUser = await prisma.usuario.upsert({
            where: { ci: '0987654321' },
            update: { password: hashedPassword },
            create: {
                ci: '0987654321',
                nombre: 'Conferencista María',
                email: 'coord@cnc.gob.ec',
                telefono: '0988888888',
                password: hashedPassword,
                rolId: conferencistaRole.id,
                entidadId: cncEntity.id,
                tipoParticipante: 0,
            },
        });

        // Usuarios
        const user1 = await prisma.usuario.upsert({
            where: { ci: '1122334455' },
            update: { password: hashedPassword },
            create: {
                ci: '1122334455',
                nombre: 'Juan Pérez',
                email: 'juan.perez@example.com',
                telefono: '0977777777',
                password: hashedPassword,
                rolId: usuarioRole.id,
                entidadId: gadEntity.id,
                tipoParticipante: 2, // Funcionario GAD
            },
        });

        const user2 = await prisma.usuario.upsert({
            where: { ci: '5544332211' },
            update: { password: hashedPassword },
            create: {
                ci: '5544332211',
                nombre: 'Maria Rodriguez',
                email: 'maria.rod@example.com',
                telefono: '0966666666',
                password: hashedPassword,
                rolId: usuarioRole.id,
                entidadId: gadEntity.id,
                tipoParticipante: 2,
            },
        });

        console.log('✅ Users created');

        // 4. Create Capacitaciones (only if they don't exist)
        console.log('Creating capacitaciones...');

        // Check if capacitaciones already exist
        const existingCapCount = await prisma.capacitacion.count();

        let capActiva, capFinalizada;

        if (existingCapCount === 0) {
            capActiva = await prisma.capacitacion.create({
                data: {
                    nombre: 'Descentralización y Gestión de Competencias',
                    descripcion: 'Curso integral sobre el proceso de descentralización en el Ecuador.',
                    fechaInicio: new Date('2026-02-01'),
                    fechaFin: new Date('2026-02-15'),
                    lugar: 'Aula Virtual CNC',
                    cuposDisponibles: 50,
                    modalidad: 'Virtual',
                    estado: 'Activa',
                }
            });

            capFinalizada = await prisma.capacitacion.create({
                data: {
                    nombre: 'Gobernanza Local y Participación Ciudadana',
                    descripcion: 'Taller práctico sobre modelos de gobernanza.',
                    fechaInicio: new Date('2025-11-10'),
                    fechaFin: new Date('2025-11-20'),
                    lugar: 'Quito, Auditorio CNC',
                    cuposDisponibles: 30,
                    modalidad: 'Presencial',
                    estado: 'Finalizada',
                }
            });
            console.log('✅ Capacitaciones created');
        } else {
            // Get existing capacitaciones
            const caps = await prisma.capacitacion.findMany({ take: 2 });
            capActiva = caps[0];
            capFinalizada = caps[1] || caps[0];
            console.log('✅ Capacitaciones already exist, skipping creation');
        }

        // 5. Create Enrollments (Inscripciones)
        console.log('Creating enrollments...');
        await prisma.usuarioCapacitacion.createMany({
            data: [
                { usuarioId: user1.id, capacitacionId: capActiva.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user2.id, capacitacionId: capActiva.id, estadoInscripcion: 'Activa', asistio: false },
                { usuarioId: user1.id, capacitacionId: capFinalizada.id, estadoInscripcion: 'Finalizada', asistio: true },
            ],
            skipDuplicates: true
        });

        console.log('✅ Enrollments created');

        // 6. Create Certificates (only if they don't exist)
        console.log('Creating certificates...');
        const existingCert = await prisma.certificado.findFirst({
            where: {
                usuarioId: user1.id,
                capacitacionId: capFinalizada.id,
            }
        });

        if (!existingCert) {
            await prisma.certificado.create({
                data: {
                    usuarioId: user1.id,
                    capacitacionId: capFinalizada.id,
                    codigoQR: `CERT-CNC-${user1.id}-${capFinalizada.id}`,
                    fechaEmision: new Date(),
                }
            });
            console.log('✅ Certificates created');
        } else {
            console.log('✅ Certificates already exist, skipping creation');
        }

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📋 Test Credentials (Password: ' + plainPassword + '):');
        console.log('1. Administrador: ' + adminUser.ci);
        console.log('2. Conferencista: ' + coordUser.ci);
        console.log('3. Usuario 1: ' + user1.ci);
        console.log('4. Usuario 2: ' + user2.ci);
    } catch (error) {
        console.error('❌ Error during seed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
