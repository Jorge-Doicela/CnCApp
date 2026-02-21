import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ecuadorData } from './data/ecuador-data';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
    console.log('🌱 Starting DEFINITIVE database seed for Presentation...');
    console.log('⚠️  This will DELETE all existing data and create fresh production-ready seed data\n');

    try {
        // ============================================
        // STEP 0: CLEAN DATABASE
        // ============================================
        console.log('🗑️  Cleaning database...');

        const tables = [
            'Certificados',
            'Usuarios_Capacitaciones',
            'Capacitaciones',
            'Plantillas',
            'Instituciones_usuario',
            'FuncionarioGAD',
            'Autoridades',
            'Usuario',
            'parroquia',
            'Cantones',
            'Provincias',
            'Entidades',
            'Rol',
            'mancomunidades',
            'instituciones_sistema',
            'cargos',
            'competencias'
        ];

        for (const table of tables) {
            try {
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
            } catch (e) {
                console.log(`⚠️  Could not truncate ${table}, trying deleteMany...`);
                // @ts-ignore
                if (prisma[table.toLowerCase()]) {
                    // @ts-ignore
                    await prisma[table.toLowerCase()].deleteMany({});
                }
            }
        }

        console.log('✅ Database cleaned and sequences reset\n');

        // ============================================
        // STEP 1: ROLES (Name-Based Robustness)
        // ============================================
        console.log('👥 Creating roles...');
        const adminRole = await prisma.rol.create({
            data: {
                nombre: 'Administrador',
                descripcion: 'Administrador del sistema con acceso completo',
                modulos: ['usuarios', 'capacitaciones', 'certificados', 'reportes', 'configuracion', 'plantillas', 'competencias'],
            },
        });

        const conferencistaRole = await prisma.rol.create({
            data: {
                nombre: 'Conferencista',
                descripcion: 'Creador de conferencias con capacidad de gestionar capacitaciones y generar certificados',
                modulos: ['capacitaciones', 'certificados', 'inscripciones'],
            },
        });

        const usuarioRole = await prisma.rol.create({
            data: {
                nombre: 'Usuario',
                descripcion: 'Usuario participante del sistema',
                modulos: ['inscripciones', 'certificados'],
            },
        });

        console.log('✅ Roles created\n');

        // ============================================
        // STEP 2: USERS
        // ============================================
        console.log('👤 Creating users...');
        const hashedPassword = await bcrypt.hash('CncSecure2025!', SALT_ROUNDS);

        // Administrator
        const adminUser = await prisma.usuario.create({
            data: {
                nombre: 'ADMINISTRADOR SISTEMA',
                primerNombre: 'ADMINISTRADOR',
                primerApellido: 'SISTEMA',
                ci: '1234567890',
                email: 'admin@cnc.gob.ec',
                password: hashedPassword,
                rolId: adminRole.id,
                tipoParticipante: 1,
            },
        });

        // Conferencistas (Creators)
        const creator1 = await prisma.usuario.create({
            data: {
                nombre: 'CARLOS MENDOZA',
                primerNombre: 'CARLOS',
                primerApellido: 'MENDOZA',
                ci: '0987654321',
                email: 'carlos.mendoza@cnc.gob.ec',
                password: hashedPassword,
                rolId: conferencistaRole.id,
                tipoParticipante: 1,
            },
        });

        const creator2 = await prisma.usuario.create({
            data: {
                nombre: 'MARIA LOPEZ',
                primerNombre: 'MARIA',
                primerApellido: 'LOPEZ',
                ci: '1357924680',
                email: 'maria.lopez@cnc.gob.ec',
                password: hashedPassword,
                rolId: conferencistaRole.id,
                tipoParticipante: 1,
            },
        });

        // Participants
        const part1 = await prisma.usuario.create({
            data: {
                nombre: 'JUAN PEREZ',
                primerNombre: 'JUAN',
                primerApellido: 'PEREZ',
                ci: '1122334455',
                email: 'juan.perez@quito.gob.ec',
                password: hashedPassword,
                rolId: usuarioRole.id,
                tipoParticipante: 2,
            },
        });

        const part2 = await prisma.usuario.create({
            data: {
                nombre: 'ANA RODRIGUEZ',
                primerNombre: 'ANA',
                primerApellido: 'RODRIGUEZ',
                ci: '5544332211',
                email: 'ana.rodriguez@quito.gob.ec',
                password: hashedPassword,
                rolId: usuarioRole.id,
                tipoParticipante: 2,
            },
        });

        console.log('✅ Users created\n');

        // ============================================
        // STEP 3: CATALOGS
        // ============================================
        console.log('📋 Creating catalogs...');

        await prisma.entidad.createMany({
            data: [
                { nombre: 'GAD PROVINCIAL' },
                { nombre: 'GAD MUNICIPAL' },
                { nombre: 'GAD PARROQUIAL' },
                { nombre: 'MANCOMUNIDAD' },
                { nombre: 'CONSULTOR/PARTICULAR' },
            ]
        });

        const cargos = await prisma.cargo.createMany({
            data: [
                { nombre: 'ALCALDE/ALCALDESA' },
                { nombre: 'PREFECTO/PREFECTA' },
                { nombre: 'CONCEJAL/CONCEJALA' },
                { nombre: 'DIRECTOR/DIRECTORA' },
                { nombre: 'ANALISTA' },
                { nombre: 'TÉCNICO/TÉCNICA' },
                { nombre: 'JEFE/JEFA DE DEPARTAMENTO' },
            ]
        });

        await prisma.competencia.createMany({
            data: [
                { nombre_competencias: 'PLANIFICACIÓN TERRITORIAL', descripcion: 'Gestión y ordenamiento del territorio' },
                { nombre_competencias: 'GESTIÓN AMBIENTAL', descripcion: 'Preservación de recursos naturales' },
                { nombre_competencias: 'VIALIDAD', descripcion: 'Mantenimiento de redes viales' },
                { nombre_competencias: 'GESTIÓN DE RIESGOS', descripcion: 'Prevención y respuesta ante desastres' },
            ]
        });

        await prisma.institucionSistema.createMany({
            data: [
                { nombre: 'CONSEJO NACIONAL DE COMPETENCIAS', tipo: 'NACIONAL' },
                { nombre: 'ASOCIACIÓN DE MUNICIPALIDADES DEL ECUADOR', tipo: 'ASOCIACION' },
                { nombre: 'CONSORCIO DE GOBIERNOS AUTÓNOMOS PROVINCIALES DEL ECUADOR', tipo: 'ASOCIACION' },
            ]
        });

        console.log('✅ Catalogs created\n');

        // ============================================
        // STEP 4: GEO DATA
        // ============================================
        console.log('🗺️  Loading Ecuador Geographic Data...');
        for (const prov of ecuadorData) {
            const createdProv = await prisma.provincia.create({
                data: { nombre: prov.provincia }
            });

            for (const cant of prov.cantones) {
                const createdCant = await prisma.canton.create({
                    data: {
                        nombre: cant.nombre,
                        provinciaId: createdProv.id
                    }
                });

                if (cant.parroquias && cant.parroquias.length > 0) {
                    await prisma.parroquia.createMany({
                        data: cant.parroquias.map(p => ({
                            nombre: p,
                            cantonId: createdCant.id
                        }))
                    });
                }
            }
        }
        console.log('✅ Geo data loaded\n');

        // ============================================
        // STEP 5: TEMPLATES (PLANTILLAS)
        // ============================================
        console.log('🖼️  Creating Certificate Templates...');
        const template1 = await prisma.plantilla.create({
            data: {
                nombre: 'MODELO ESTÁNDAR CNC 2025',
                imagenUrl: 'https://cdn.cnc.gob.ec/templates/standard_2025.png',
                configuracion: {
                    components: [
                        { type: 'text', value: '{nombre_usuario}', x: 100, y: 200, style: { fontSize: 24, fontWeight: 'bold' } },
                        { type: 'text', value: 'Por haber participado en el taller {nombre_capacitacion}', x: 100, y: 250 },
                        { type: 'qr', x: 400, y: 500, size: 100 }
                    ]
                }
            }
        });

        const template2 = await prisma.plantilla.create({
            data: {
                nombre: 'MODELO RECONOCIMIENTO ESPECIAL',
                imagenUrl: 'https://cdn.cnc.gob.ec/templates/special_recognition.png',
                configuracion: {
                    theme: 'gold',
                    layout: 'landscape'
                }
            }
        });

        console.log('✅ Templates created\n');

        // ============================================
        // STEP 6: TRAINING SESSIONS (CAPACITACIONES)
        // ============================================
        console.log('🎓 Creating Training Sessions...');
        const training1 = await prisma.capacitacion.create({
            data: {
                nombre: 'TALLER DE FORTALECIMIENTO INSTITUCIONAL PARA GADS',
                descripcion: 'Optimización de procesos internos y gestión de recursos públicos en gobiernos autónomos.',
                fechaInicio: new Date('2025-03-01'),
                fechaFin: new Date('2025-03-05'),
                lugar: 'Sede CNC - Quito',
                cuposDisponibles: 50,
                modalidad: 'Presencial',
                estado: 'Activa',
                plantillaId: template1.id
            }
        });

        const training2 = await prisma.capacitacion.create({
            data: {
                nombre: 'SEMINARIO DE GESTIÓN DE COMPETENCIAS TERRITORIALES',
                descripcion: 'Análisis profundo del marco legal y práctico de las competencias transferidas.',
                fechaInicio: new Date('2025-01-15'),
                fechaFin: new Date('2025-01-20'),
                lugar: 'Virtual - Zoom',
                cuposDisponibles: 200,
                modalidad: 'Virtual',
                estado: 'Finalizada',
                plantillaId: template1.id
            }
        });

        const training3 = await prisma.capacitacion.create({
            data: {
                nombre: 'CURSO DE PLANIFICACIÓN Y DESARROLLO RURAL',
                descripcion: 'Estrategias para el desarrollo sostenible en zonas rurales del Ecuador.',
                fechaInicio: new Date('2025-06-10'),
                fechaFin: new Date('2025-06-15'),
                lugar: 'Hotel Oro Verde - Cuenca',
                cuposDisponibles: 30,
                modalidad: 'Semipresencial',
                estado: 'En Progreso',
                plantillaId: template2.id
            }
        });

        console.log('✅ Training sessions created\n');

        // ============================================
        // STEP 7: REGISTRATIONS (INSCRIPCIONES)
        // ============================================
        console.log('📝 Creating registrations...');

        // Register participants to finished training to generate certificates
        await prisma.usuarioCapacitacion.createMany({
            data: [
                { usuarioId: part1.id, capacitacionId: training2.id, asistio: true, rolCapacitacion: 'Participante' },
                { usuarioId: part2.id, capacitacionId: training2.id, asistio: true, rolCapacitacion: 'Participante' },
                { usuarioId: part1.id, capacitacionId: training1.id, asistio: false, rolCapacitacion: 'Participante' },
                { usuarioId: creator1.id, capacitacionId: training1.id, asistio: false, rolCapacitacion: 'Ponente' },
            ]
        });

        console.log('✅ Registrations created\n');

        // ============================================
        // STEP 8: CERTIFICATES (CERTIFICADOS)
        // ============================================
        console.log('🎖️  Generating sample certificates...');

        await prisma.certificado.create({
            data: {
                usuarioId: part1.id,
                capacitacionId: training2.id,
                codigoQR: `CERT-QR-${Date.now()}-1`,
                pdfUrl: 'https://cdn.cnc.gob.ec/certificates/CERT-001-P1.pdf'
            }
        });

        await prisma.certificado.create({
            data: {
                usuarioId: part2.id,
                capacitacionId: training2.id,
                codigoQR: `CERT-QR-${Date.now()}-2`,
                pdfUrl: 'https://cdn.cnc.gob.ec/certificates/CERT-002-P2.pdf'
            }
        });

        console.log('✅ Certificates generated\n');

        console.log('✨ DEFINITIVE SEEDING COMPLETED SUCCESSFULLY ✨');

    } catch (error) {
        console.error('❌ Error during definitive seeding:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
