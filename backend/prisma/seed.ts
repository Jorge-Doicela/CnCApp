import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ecuadorData } from './data/ecuador-data';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
    console.log('🌱 Starting COMPLETE database seed (Real Ecuador Data)...');
    console.log('⚠️  This will DELETE all existing data and create fresh seed data\n');

    try {
        // ============================================
        // STEP 0: CLEAN DATABASE
        // ============================================
        console.log('🗑️  Cleaning database...');

        // Delete in correct order (respecting foreign keys)
        // Note: For PostgreSQL we can use TRUNCATE with CASCADE
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
                // Fallback for tables that might not exist or other errors
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
        // STEP 1: ROLES
        // ============================================
        console.log('👥 Creating roles...');
        const adminRole = await prisma.rol.create({
            data: {
                nombre: 'Administrador',
                descripcion: 'Administrador del sistema con acceso completo',
                modulos: ['usuarios', 'capacitaciones', 'certificados', 'reportes', 'configuracion'],
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

        await prisma.usuario.create({
            data: {
                nombre: 'ADMINISTRADOR SISTEMA',
                primerNombre: 'ADMINISTRADOR',
                primerApellido: 'SISTEMA',
                ci: '1234567890',
                email: 'admin@cnc.gob.ec',
                password: hashedPassword,
                rolId: adminRole.id,
                tipoParticipante: 1, // Admin/Internal
            },
        });

        await prisma.usuario.create({
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

        await prisma.usuario.create({
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

        await prisma.usuario.create({
            data: {
                nombre: 'ROBERTO SANCHEZ',
                primerNombre: 'ROBERTO',
                primerApellido: 'SANCHEZ',
                ci: '2468013579',
                email: 'roberto.sanchez@cnc.gob.ec',
                password: hashedPassword,
                rolId: conferencistaRole.id,
                tipoParticipante: 1,
            },
        });

        // Example participants
        await prisma.usuario.create({
            data: {
                nombre: 'JUAN PEREZ',
                primerNombre: 'JUAN',
                primerApellido: 'PEREZ',
                ci: '1122334455',
                email: 'juan.perez@quito.gob.ec',
                password: hashedPassword,
                rolId: usuarioRole.id,
                tipoParticipante: 2, // External
            },
        });

        await prisma.usuario.create({
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
        // STEP 3: ADMINISTRATIVE CATALOGS
        // ============================================
        console.log('📋 Creating administrative catalogs...');

        // Entidades
        await prisma.entidad.createMany({
            data: [
                { nombre: 'GAD PROVINCIAL' },
                { nombre: 'GAD MUNICIPAL' },
                { nombre: 'GAD PARROQUIAL' },
                { nombre: 'MANCOMUNIDAD' },
                { nombre: 'CONSULTOR/PARTICULAR' },
            ]
        });

        // Cargos
        await prisma.cargo.createMany({
            data: [
                { nombre: 'ALCALDE/ALCALDESA' },
                { nombre: 'PREFECTO/PREFECTA' },
                { nombre: 'CONCEJAL/CONCEJALA' },
                { nombre: 'DIRECTOR/DIRECTORA' },
                { nombre: 'COORDINADOR/COORDINADORA' },
                { nombre: 'ANALISTA' },
                { nombre: 'TÉCNICO/TÉCNICA' },
                { nombre: 'ASISTENTE' },
                { nombre: 'GERENTE' },
                { nombre: 'JEFE/JEFA DE DEPARTAMENTO' },
                { nombre: 'ASESOR/ASESORA' },
            ]
        });

        // Competencias
        await prisma.competencia.createMany({
            data: [
                { nombre_competencias: 'PLANIFICACIÓN TERRITORIAL' },
                { nombre_competencias: 'GESTIÓN AMBIENTAL' },
                { nombre_competencias: 'VIALIDAD' },
                { nombre_competencias: 'AGUA POTABLE Y SANEAMIENTO' },
                { nombre_competencias: 'GESTIÓN DE RIESGOS' },
                { nombre_competencias: 'TRÁNSITO Y TRANSPORTE' },
                { nombre_competencias: 'PATRIMONIO CULTURAL' },
                { nombre_competencias: 'DESARROLLO ECONÓMICO' },
            ]
        });

        // Instituciones del Sistema
        await prisma.institucionSistema.createMany({
            data: [
                { nombre: 'CONSEJO NACIONAL DE COMPETENCIAS', tipo: 'NACIONAL' },
                { nombre: 'ASOCIACIÓN DE MUNICIPALIDADES DEL ECUADOR', tipo: 'ASOCIACION' },
                { nombre: 'CONSORCIO DE GOBIERNOS AUTÓNOMOS PROVINCIALES DEL ECUADOR', tipo: 'ASOCIACION' },
                { nombre: 'CONSEJO NACIONAL DE GOBIERNOS PARROQUIALES RURALES DEL ECUADOR', tipo: 'ASOCIACION' },
            ]
        });

        console.log('✅ Catalogs created\n');

        // ============================================
        // STEP 4: GEO DATA (ECUADOR)
        // ============================================
        console.log('🗺️  Loading Ecuador Geographic Data...');

        for (const prov of ecuadorData) {
            const createdProv = await prisma.provincia.create({
                data: {
                    nombre: prov.provincia, // Fixed field name
                }
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

        console.log('✨ SEEDING COMPLETED SUCCESSFULLY ✨');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
