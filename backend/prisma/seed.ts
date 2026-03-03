import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ecuadorData } from './data/ecuador-data';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
    console.log('🚀 Starting PRODUCT LAUNCH database seed...');
    console.log('💎 Generating ultra-realistic data for presentation...\n');

    try {
        // ============================================
        // STEP 0: CLEAN DATABASE (FULL RESET)
        // ============================================
        const tables = [
            'Certificados', 'Usuarios_Capacitaciones', 'Capacitaciones', 'Plantillas',
            'Instituciones_usuario', 'FuncionarioGAD', 'Autoridades', 'Usuario',
            'parroquia', 'Cantones', 'Provincias', 'Entidades', 'Rol',
            'mancomunidades', 'instituciones_sistema', 'cargos', 'competencias',
            'Generos', 'Etnias', 'TiposParticipante', 'Nacionalidades', 'grados_ocupacionales'
        ];

        for (const table of tables) {
            try {
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
            } catch (e) {
                console.log(`⚠️  Could not truncate ${table}, skipping...`);
            }
        }
        console.log('✅ System clean\n');

        // ============================================
        // STEP 1: ROLES
        // ============================================
        console.log('👥 Configuring Roles...');
        const adminRole = await prisma.rol.create({
            data: {
                nombre: 'Administrador',
                descripcion: 'Control total de la plataforma y reportes gerenciales',
                modulos: ['usuarios', 'capacitaciones', 'certificados', 'reportes', 'configuracion', 'plantillas', 'competencias'],
            },
        });

        const conferencistaRole = await prisma.rol.create({
            data: {
                nombre: 'Conferencista',
                descripcion: 'Gestión de contenidos académicos y certificación masiva',
                modulos: ['capacitaciones', 'certificados', 'inscripciones'],
            },
        });

        const usuarioRole = await prisma.rol.create({
            data: {
                nombre: 'Usuario',
                descripcion: 'Participante en programas de formación territorial',
                modulos: ['inscripciones', 'certificados'],
            },
        });

        // ============================================
        // STEP 2: CATALOGS (Realistic)
        // ============================================
        console.log('📋 Loading Product Catalogs...');

        await prisma.genero.createMany({
            data: [
                { nombre: 'Masculino' },
                { nombre: 'Femenino' }
            ]
        });

        await prisma.etnia.createMany({
            data: [
                { nombre: 'Mestizo' },
                { nombre: 'Afroecuatoriano' },
                { nombre: 'Montubio' },
                { nombre: 'Indígena' },
                { nombre: 'Blanco' },
                { nombre: 'Otro' }
            ]
        });

        await prisma.nacionalidad.createMany({
            data: [
                { nombre: 'Ecuatoriana' },
                { nombre: 'Otra' }
            ]
        });

        await prisma.tipoParticipante.createMany({
            data: [
                { nombre: 'Autoridad' },
                { nombre: 'Ciudadano' },
                { nombre: 'Funcionario de GAD' },
                { nombre: 'Institución' }
            ]
        });
        const entidades = await prisma.entidad.createMany({
            data: [
                { nombre: 'GOBIERNOS AUTÓNOMOS DESCENTRALIZADOS PROVINCIALES' },
                { nombre: 'GOBIERNOS AUTÓNOMOS DESCENTRALIZADOS MUNICIPALES' },
                { nombre: 'GOBIERNOS AUTÓNOMOS DESCENTRALIZADOS PARROQUIALES' },
                { nombre: 'INSTITUCIONES DEL SECTOR PÚBLICO NACIONAL' },
                { nombre: 'ORGANISMOS INTERNACIONALES' },
                { nombre: 'ACADEMIA Y CENTROS DE INVESTIGACIÓN' },
                { nombre: 'CONSULTORES Y PROFESIONALES INDEPENDIENTES' },
            ]
        });

        await prisma.gradoOcupacional.createMany({
            data: [
                { nombre: 'PROFESIONAL 1' },
                { nombre: 'PROFESIONAL 2' },
                { nombre: 'PROFESIONAL 3' },
                { nombre: 'PROFESIONAL 4' },
                { nombre: 'PROFESIONAL 5' },
                { nombre: 'PROFESIONAL 6' },
                { nombre: 'TÉCNICO A' },
                { nombre: 'TÉCNICO B' },
                { nombre: 'TÉCNICO C' },
                { nombre: 'SERVIDOR PÚBLICO 1' },
                { nombre: 'SERVIDOR PÚBLICO 2' },
                { nombre: 'SERVIDOR PÚBLICO 3' },
                { nombre: 'SERVIDOR PÚBLICO 4' },
                { nombre: 'SERVIDOR PÚBLICO 5' },
                { nombre: 'SERVIDOR PÚBLICO 6' },
                { nombre: 'SERVIDOR PÚBLICO 7' },
            ]
        });

        await prisma.cargo.createMany({
            data: [
                { nombre: 'ALCALDE / ALCALDESA' },
                { nombre: 'PREFECTO / PREFECTA' },
                { nombre: 'PRESIDENTE / PRESIDENTA GAD PARROQUIAL' },
                { nombre: 'CONCEJAL / CONCEJALA METROPOLITANO' },
                { nombre: 'DIRECTOR / DIRECTORA DE PLANIFICACIÓN' },
                { nombre: 'COORDINADOR / COORDINADORA ESTRATÉGICA' },
                { nombre: 'ESPECIALISTA EN PROYECTOS' },
                { nombre: 'TÉCNICO / TÉCNICA DE CAMPO' },
                { nombre: 'SECRETARIO / SECRETARIA GENERAL' },
                { nombre: 'ASISTENTE ADMINISTRATIVO' },
                { nombre: 'ASESOR POLÍTICO' },
            ]
        });

        await prisma.competencia.createMany({
            data: [
                { nombre_competencias: 'PLANIFICACIÓN Y ORDENAMIENTO TERRITORIAL', descripcion: 'Gestión integral del desarrollo del territorio' },
                { nombre_competencias: 'GESTIÓN AMBIENTAL Y ÁREAS PROTEGIDAS', descripcion: 'Preservación de la biodiversidad y recursos' },
                { nombre_competencias: 'VIALIDAD Y TRANSPORTE PROVINCIAL', descripcion: 'Infraestructura y movilidad rural' },
                { nombre_competencias: 'COOPERACIÓN INTERNACIONAL', descripcion: 'Gestión de recursos externos y hermanamientos' },
                { nombre_competencias: 'FOMENTO PRODUCTIVO Y AGROPECUARIO', descripcion: 'Impulso a la economía local y seguridad alimentaria' },
                { nombre_competencias: 'SISTEMAS DE RIEGO Y DRENAJE', descripcion: 'Infraestructura para la producción agrícola' },
                { nombre_competencias: 'RECURSOS NATURALES Y MINERÍA', descripcion: 'Gestión técnica de recursos del subsuelo' },
                { nombre_competencias: 'FORTALECIMIENTO INSTITUCIONAL', descripcion: 'Mejora continua y modernización de los GAD' },
            ]
        });

        const insSistema = await prisma.institucionSistema.createMany({
            data: [
                { nombre: 'CONSEJO NACIONAL DE COMPETENCIAS (CNC)', tipo: 'ORGANISMO TÉCNICO' },
                { nombre: 'ASOCIACIÓN DE MUNICIPALIDADES DEL ECUADOR (AME)', tipo: 'GREMIO' },
                { nombre: 'CONSORCIO DE GADS PROVINCIALES (CONGOPE)', tipo: 'GREMIO' },
                { nombre: 'CONSEJO NACIONAL DE GADS PARROQUIALES (CONAGOPARE)', tipo: 'GREMIO' },
                { nombre: 'SECRETARÍA NACIONAL DE PLANIFICACIÓN', tipo: 'NACIONAL' },
                { nombre: 'MINISTERIO DE ECONOMÍA Y FINANZAS', tipo: 'NACIONAL' },
            ]
        });

        // ============================================
        // STEP 3: GEO DATA
        // ============================================
        console.log('🗺️  Syncing National Geographic Model (Provinces/Cantons/Parishes)...');
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

        // ============================================
        // STEP 4: USERS (Massive & Realistic)
        // ============================================
        console.log('👥 Generating User Ecosystem...');
        const hashedPassword = await bcrypt.hash('CncSecure2025!', SALT_ROUNDS);

        const usersData = [
            // Administrators
            { nombre: 'JORGE DOICELA', ci: '1234567890', email: 'jorge.doicela@cnc.gob.ec', roleId: adminRole.id, authUid: 'admin-01' },
            { nombre: 'KAREN MENDOZA', ci: '1722334455', email: 'karen.mendoza@cnc.gob.ec', roleId: adminRole.id, authUid: 'admin-02' },

            // Conferencistas
            { nombre: 'DR. RICARDO PAZMIÑO', ci: '0911223344', email: 'ricardo.pazmino@capacitacion.ec', roleId: conferencistaRole.id, authUid: 'conf-01' },
            { nombre: 'MAG. ELENA VITERI', ci: '0102030405', email: 'elena.viteri@consultoria.com', roleId: conferencistaRole.id, authUid: 'conf-02' },
            { nombre: 'ING. SEBASTIÁN NOBOA', ci: '1803040506', email: 'snoboa@expertos.org', roleId: conferencistaRole.id, authUid: 'conf-03' },

            // Participants (Varied Regions)
            { nombre: 'FABIÁN IZQUIERDO', ci: '1755112233', email: 'fizquierdo@quito.gob.ec', roleId: usuarioRole.id, authUid: 'user-01' },
            { nombre: 'LAURA ALCIVAR', ci: '1311223344', email: 'laura.alcivar@manta.gob.ec', roleId: usuarioRole.id, authUid: 'user-02' },
            { nombre: 'GIOVANNY CASTILLO', ci: '0122334455', email: 'gcastillo@cuenca.gob.ec', roleId: usuarioRole.id, authUid: 'user-03' },
            { nombre: 'DIANA MORALES', ci: '0933445566', email: 'dmorales@guayaquil.gob.ec', roleId: usuarioRole.id, authUid: 'user-04' },
            { nombre: 'ROBERTO CHIRIBOGA', ci: '1004050607', email: 'rchiriboga@ibarra.gob.ec', roleId: usuarioRole.id, authUid: 'user-05' },
            { nombre: 'XIMENA SALTOS', ci: '1205060708', email: 'xsaltos@portoviejo.gob.ec', roleId: usuarioRole.id, authUid: 'user-06' },
            { nombre: 'MARCO TULIO', ci: '2006070809', email: 'mtulio@galapagos.gob.ec', roleId: usuarioRole.id, authUid: 'user-07' },
            { nombre: 'PATRICIO RIVERA', ci: '0507080910', email: 'privera@latacunga.gob.ec', roleId: usuarioRole.id, authUid: 'user-08' },
            { nombre: 'SOFÍA ENDARA', ci: '1108091011', email: 'sendara@ambato.gob.ec', roleId: usuarioRole.id, authUid: 'user-09' },
            { nombre: 'ANDRÉS VELASCO', ci: '0409101112', email: 'avelasco@tulcan.gob.ec', roleId: usuarioRole.id, authUid: 'user-10' },
        ];

        const createdUsers = [];
        for (const u of usersData) {
            const user = await prisma.usuario.create({
                data: {
                    nombre: u.nombre,
                    primerNombre: u.nombre.split(' ')[0],
                    primerApellido: u.nombre.split(' ').slice(1).join(' '),
                    ci: u.ci,
                    email: u.email,
                    password: hashedPassword,
                    rolId: u.roleId,
                    authUid: u.authUid,
                    tipoParticipanteId: u.roleId === adminRole.id ? 1 : 2,
                }
            });
            createdUsers.push(user);
        }

        // ============================================
        // STEP 5: TEMPLATES & TRAINING
        // ============================================
        console.log('🖼️  Configuring Professional Templates...');
        const templateStd = await prisma.plantilla.create({
            data: {
                nombre: 'CERTIFICADO INSTITUCIONAL CNC - ESTÁNDAR',
                imagenUrl: '/assets/templates/cnc-standard.jpg',
                configuracion: { theme: { primary: '#1a4a7c' }, elements: [{ id: 'name', type: 'text', text: '{USER_NAME}' }] }
            }
        });

        const templateExec = await prisma.plantilla.create({
            data: {
                nombre: 'CERTIFICADO DE EXCELENCIA GERENCIAL GAD',
                imagenUrl: '/assets/templates/cnc-premium.jpg',
                configuracion: { theme: { primary: '#b49d2a' } }
            }
        });

        console.log('🎓 Launching Training Portfolio...');
        const trainingSessions = [
            {
                nombre: 'DIPLOMADO EN GESTIÓN PÚBLICA TERRITORIAL 2025',
                descripcion: 'Programa integral para la modernización de la gestión en los Gobiernos Autónomos Descentralizados.',
                fechaInicio: new Date('2025-01-10'), fechaFin: new Date('2025-02-15'),
                lugar: 'QUITO / VIRTUAL', cupos: 500, modalidad: 'Híbrida', estado: 'Finalizada', pId: templateStd.id
            },
            {
                nombre: 'TALLER PRÁCTICO: PLANIFICACIÓN Y POAS 2026',
                descripcion: 'Metodologías ágiles para el diseño de planes operativos anuales con enfoque en resultados.',
                fechaInicio: new Date('2025-03-01'), fechaFin: new Date('2025-03-05'),
                lugar: 'GUAYAQUIL', cupos: 150, modalidad: 'Presencial', estado: 'Activa', pId: templateStd.id
            },
            {
                nombre: 'SIMPOSIO INTERNACIONAL DE CIUDADES SOSTENIBLES',
                descripcion: 'Intercambio de experiencias globales en resiliencia urbana y cambio climático.',
                fechaInicio: new Date('2025-05-20'), fechaFin: new Date('2025-05-22'),
                lugar: 'CUENCA', cupos: 300, modalidad: 'Presencial', estado: 'Activa', pId: templateExec.id
            },
            {
                nombre: 'CURSO AVANZADO: VIALIDAD RURAL Y PUENTES',
                descripcion: 'Diseño técnico y mantenimiento preventivo de infraestructura vial para provincias.',
                fechaInicio: new Date('2025-02-05'), fechaFin: new Date('2025-02-28'),
                lugar: 'VIRTUAL', cupos: 100, modalidad: 'Virtual', estado: 'En Progreso', pId: templateStd.id
            },
            {
                nombre: 'INDUCCIÓN PARA NUEVAS AUTORIDADES LOCALES',
                descripcion: 'Marco normativo y responsabilidades legales en el ejercicio del cargo público.',
                fechaInicio: new Date('2025-06-15'), fechaFin: new Date('2025-06-20'),
                lugar: 'QUITO', cupos: 1000, modalidad: 'Presencial', estado: 'Programada', pId: templateStd.id
            },
            {
                nombre: 'SEMINARIO: PRESUPUESTO PARTICIPATIVO Y CIUDADANÍA',
                descripcion: 'Mecanismos legales de participación ciudadana en el ciclo presupuestario.',
                fechaInicio: new Date('2024-11-01'), fechaFin: new Date('2024-11-10'),
                lugar: 'MANTA', cupos: 200, modalidad: 'Semipresencial', estado: 'Finalizada', pId: templateStd.id
            }
        ];

        const createdTrainings = [];
        for (const t of trainingSessions) {
            const session = await prisma.capacitacion.create({
                data: {
                    nombre: t.nombre,
                    descripcion: t.descripcion,
                    fechaInicio: t.fechaInicio,
                    fechaFin: t.fechaFin,
                    lugar: t.lugar,
                    cuposDisponibles: t.cupos,
                    modalidad: t.modalidad,
                    estado: t.estado,
                    plantillaId: t.pId
                }
            });
            createdTrainings.push(session);
        }

        // ============================================
        // STEP 6: REGISTRATIONS & CERTIFICATES (Massive)
        // ============================================
        console.log('📝 Distributing Registrations and Generating Metrics...');

        // Randomly register users to various trainings to populate metrics
        for (const user of createdUsers.slice(5)) { // Only participants
            for (const training of createdTrainings) {
                // 70% probability of registration
                if (Math.random() > 0.3) {
                    await prisma.usuarioCapacitacion.create({
                        data: {
                            usuarioId: user.id,
                            capacitacionId: training.id,
                            asistio: training.estado === 'Finalizada',
                            rolCapacitacion: 'Participante',
                            estadoInscripcion: 'Activa'
                        }
                    });

                    // If training is finished and user assisted, generate certificate
                    if (training.estado === 'Finalizada') {
                        await prisma.certificado.create({
                            data: {
                                usuarioId: user.id,
                                capacitacionId: training.id,
                                codigoQR: `CERT-${training.id}-${user.id}-${Math.floor(Math.random() * 10000)}`,
                                pdfUrl: `/certificates/cert_${training.id}_${user.id}.pdf`
                            }
                        });
                    }
                }
            }
        }

        console.log('\n✨ FINAL PRODUCT DATA LOADED SUCCESSFULLY ✨');
        console.log('🎯 System ready for Presentation and Launch.');

    } catch (error) {
        console.error('❌ Error during launch seeding:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
