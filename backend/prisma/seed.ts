import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
    cargosList, gremiosList,
    entidadesCentralesList, cooperantesList, academiaList,
    privadoList, ciudadaniaList,
    regimenEspecialList, mancomunidadesList,
    bomberosList, empresasPublicasList,
    registrosPropiedadList, consejosCantonalesList
} from './data/form-options-index';
import {
    ensureMunicipalInstitucionesSistema,
    seedGeoSqlProvincias,
    seedGadParroquias,
    seedEducacionBasica
} from './seed-reference-catalogs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/** Evita que falle todo el seed si en la BD falta alguna tabla (p. ej. entornos desalineados). */
async function safeDeleteMany(label: string, run: () => Promise<unknown>): Promise<void> {
    try {
        await run();
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2021') {
            console.warn(`[seed] Limpieza omitida (${label}): tabla no existe en esta base.`);
            return;
        }
        throw e;
    }
}

const TIPO_INSTITUCION_NOMBRES_SEED = [
    'PROVINCIAL',
    'MUNICIPAL',
    'PARROQUIAL RURAL',
    'GREMIOS',
    'CENTRAL',
    'OTRAS INSTITUCIONES DEL ESTADO',
    'COOPERANTES',
    'ACADEMIA',
    'EDUCACIÓN GENERAL BÁSICA Y BACHILLERATO',
    'PRIVADO',
    'CIUDADANÍA',
    'MANCOMUNIDADES Y CONSORCIOS',
    'RÉGIMEN ESPECIAL'
] as const;

type TipoInstMap = Record<string, { id: number }>;

/** Crea o reutiliza filas en tipo_institucion; si la tabla no existe, devuelve {}. */
async function upsertTiposInstitucion(prisma: PrismaClient): Promise<TipoInstMap> {
    const map: TipoInstMap = {};
    let tableMissing = false;

    for (const nombre of TIPO_INSTITUCION_NOMBRES_SEED) {
        try {
            const row = await prisma.tipoInstitucion.upsert({
                where: { nombre },
                update: {},
                create: { nombre }
            });
            map[nombre] = row;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2021') {
                tableMissing = true;
                break;
            }
            console.warn(`[seed] tipo_institucion upsert falló para "${nombre}" (se continúa):`, e);
        }
    }

    if (tableMissing) {
        console.warn('[seed] Tabla tipo_institucion no disponible; se omiten tipoInstitucionId en instituciones_sistema.');
        return {};
    }

    if (Object.keys(map).length === 0) {
        try {
            const all = await prisma.tipoInstitucion.findMany();
            for (const row of all) {
                map[row.nombre] = row;
            }
        } catch {
            /* vacío */
        }
    }

    return map;
}

const EXPECTED_PROVINCIAS_SEED = 23;

async function main() {
    console.log('Starting PRODUCT LAUNCH database seed...');
    console.log('Generating ultra-realistic data for presentation...\n');

    let seedFailed = false;

    try {
        // ============================================
        // STEP 0: CLEAN DATABASE (FULL RESET)
        // ============================================
        // Limpiar en orden inverso para evitar errores de claves foráneas
        const regimenesEspeciales = ['CONSEJO DE GOBIERNO DE RÉGIMEN ESPECIAL DE GALÁPAGOS'];

        console.log('Cleaning existing data...');
        await safeDeleteMany('certificados', () => prisma.certificado.deleteMany());
        await safeDeleteMany('usuarios_capacitaciones', () => prisma.usuarioCapacitacion.deleteMany());
        await safeDeleteMany('capacitaciones', () => prisma.capacitacion.deleteMany());
        await safeDeleteMany('plantillas', () => prisma.plantilla.deleteMany());
        await safeDeleteMany('instituciones_usuario', () => prisma.institucionUsuario.deleteMany());
        await safeDeleteMany('funcionarios_gad', () => prisma.funcionarioGAD.deleteMany());
        await safeDeleteMany('autoridades', () => prisma.autoridad.deleteMany());
        await safeDeleteMany('usuarios', () => prisma.usuario.deleteMany());
        await safeDeleteMany('gad_parroquias', () => prisma.gadParroquia.deleteMany());
        await safeDeleteMany('parroquias', () => prisma.parroquia.deleteMany());
        await safeDeleteMany('cantones', () => prisma.canton.deleteMany());
        await safeDeleteMany('provincias', () => prisma.provincia.deleteMany());
        await safeDeleteMany('entidades', () => prisma.entidad.deleteMany());
        await safeDeleteMany('roles', () => prisma.rol.deleteMany());
        await safeDeleteMany('mancomunidades', () => prisma.mancomunidad.deleteMany());
        await safeDeleteMany('instituciones_sistema', () => prisma.institucionSistema.deleteMany());
        await safeDeleteMany('cargos', () => prisma.cargo.deleteMany());
        await safeDeleteMany('competencias', () => prisma.competencia.deleteMany());
        await safeDeleteMany('generos', () => prisma.genero.deleteMany());
        await safeDeleteMany('etnias', () => prisma.etnia.deleteMany());
        await safeDeleteMany('tipos_participante', () => prisma.tipoParticipante.deleteMany());
        await safeDeleteMany('nacionalidades', () => prisma.nacionalidad.deleteMany());
        await safeDeleteMany('grados_ocupacionales', () => prisma.gradoOcupacional.deleteMany());
        await safeDeleteMany('tipo_institucion', () => prisma.tipoInstitucion.deleteMany());
        await safeDeleteMany('regimen_especial', () => prisma.regimenEspecial.deleteMany());

        console.log('System clean\n');

        // ============================================
        // STEP 1: ROLES
        // ============================================
        console.log('Configuring Roles (upsert por codigo)...');
        const adminModulos = [
            'Ver Perfil',
            'Ver conferencias',
            'Gestionar roles',
            'Gestionar capacitaciones',
            'Gestionar usuarios',
            'Gestionar entidades',
            'Gestionar provincias',
            'Gestionar parroquias',
            'Gestionar cantones',
            'Gestionar competencias',
            'Gestionar instituciones',
            'Gestionar plantillas',
            'Gestionar reportes',
            'Gestionar grados ocupacionales',
            'Gestionar cargos',
            'Validar certificados'
        ];
        const adminRole = await prisma.rol.upsert({
            where: { codigo: 'ADMIN' },
            update: {
                nombre: 'Administrador',
                descripcion: 'Control total de la plataforma y reportes gerenciales',
                modulos: adminModulos
            },
            create: {
                nombre: 'Administrador',
                codigo: 'ADMIN',
                descripcion: 'Control total de la plataforma y reportes gerenciales',
                modulos: adminModulos
            }
        });

        const conferencistaRole = await prisma.rol.upsert({
            where: { codigo: 'CONFERENCISTA' },
            update: {
                nombre: 'Conferencista',
                descripcion: 'Gestión de contenidos académicos y certificación masiva',
                modulos: ['Ver Perfil', 'Ver conferencias', 'Gestionar capacitaciones', 'Gestionar plantillas', 'Validar certificados']
            },
            create: {
                nombre: 'Conferencista',
                codigo: 'CONFERENCISTA',
                descripcion: 'Gestión de contenidos académicos y certificación masiva',
                modulos: ['Ver Perfil', 'Ver conferencias', 'Gestionar capacitaciones', 'Gestionar plantillas', 'Validar certificados']
            }
        });

        const usuarioRole = await prisma.rol.upsert({
            where: { codigo: 'USUARIO' },
            update: {
                nombre: 'Usuario',
                descripcion: 'Participante en programas de formación territorial',
                modulos: ['Ver Perfil', 'Ver conferencias']
            },
            create: {
                nombre: 'Usuario',
                codigo: 'USUARIO',
                descripcion: 'Participante en programas de formación territorial',
                modulos: ['Ver Perfil', 'Ver conferencias']
            }
        });

        // ============================================
        // STEP 2: CATALOGS (Realistic)
        // ============================================
        console.log('Loading Product Catalogs...');

        await prisma.genero.createMany({
            data: [
                { nombre: 'Masculino' },
                { nombre: 'Femenino' }
            ],
            skipDuplicates: true
        });

        await prisma.etnia.createMany({
            data: [
                { nombre: 'Mestizo' },
                { nombre: 'Afroecuatoriano' },
                { nombre: 'Montubio' },
                { nombre: 'Indígena' },
                { nombre: 'Blanco' },
                { nombre: 'Otro' }
            ],
            skipDuplicates: true
        });

        await prisma.nacionalidad.createMany({
            data: [
                { nombre: 'Ecuatoriana' },
                { nombre: 'Otra' }
            ],
            skipDuplicates: true
        });

        const tipoAutoridad = await prisma.tipoParticipante.upsert({
            where: { codigo: 'AUTORIDAD' },
            update: { nombre: 'Autoridad' },
            create: { nombre: 'Autoridad', codigo: 'AUTORIDAD' }
        });
        const tipoCiudadano = await prisma.tipoParticipante.upsert({
            where: { codigo: 'CIUDADANO' },
            update: { nombre: 'Ciudadano' },
            create: { nombre: 'Ciudadano', codigo: 'CIUDADANO' }
        });
        await prisma.tipoParticipante.upsert({
            where: { codigo: 'FUNCIONARIO_GAD' },
            update: { nombre: 'Funcionario de GAD' },
            create: { nombre: 'Funcionario de GAD', codigo: 'FUNCIONARIO_GAD' }
        });
        await prisma.tipoParticipante.upsert({
            where: { codigo: 'INSTITUCION' },
            update: { nombre: 'Institución' },
            create: { nombre: 'Institución', codigo: 'INSTITUCION' }
        });
        await prisma.entidad.createMany({
            data: [
                { nombre: 'INSTITUCIÓN — NIVEL PROVINCIAL', codigo: 'NIVEL_PROVINCIAL' },
                { nombre: 'INSTITUCIÓN — NIVEL MUNICIPAL (CANTONES)', codigo: 'NIVEL_MUNICIPAL' },
                { nombre: 'INSTITUCIÓN — NIVEL PARROQUIAL RURAL', codigo: 'NIVEL_PARROQUIAL' },
                { nombre: 'GREMIOS', codigo: 'GREMIOS' },
                { nombre: 'INSTITUCIÓN — NIVEL CENTRAL', codigo: 'NIVEL_CENTRAL' },
                { nombre: 'COOPERANTES', codigo: 'COOPERANTES' },
                { nombre: 'ACADEMIA', codigo: 'ACADEMIA' },
                { nombre: 'EDUCACIÓN GENERAL BÁSICA Y BACHILLERATO', codigo: 'EDUCACION' },
                { nombre: 'PRIVADO', codigo: 'PRIVADO' },
                { nombre: 'CIUDADANÍA', codigo: 'CIUDADANIA' },
                { nombre: 'MANCOMUNIDADES Y CONSORCIOS', codigo: 'MANCOMUNIDADES' },
                { nombre: 'RÉGIMEN ESPECIAL', codigo: 'REGIMEN_ESPECIAL' }
            ]
        });

        console.log('Seeding Institution Types (upsert)...');
        const tiposInst = await upsertTiposInstitucion(prisma);
        const tid = (nombre: (typeof TIPO_INSTITUCION_NOMBRES_SEED)[number]): number | undefined =>
            tiposInst[nombre]?.id;

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
            ],
            skipDuplicates: true
        });

        await prisma.cargo.createMany({
            data: cargosList.map(c => ({ nombre: c })),
            skipDuplicates: true
        });

        await prisma.competencia.createMany({
            data: [
                { nombre: 'PLANIFICACIÓN Y ORDENAMIENTO TERRITORIAL', descripcion: 'Gestión integral del desarrollo del territorio' },
                { nombre: 'GESTIÓN AMBIENTAL Y ÁREAS PROTEGIDAS', descripcion: 'Preservación de la biodiversidad y recursos' },
                { nombre: 'VIALIDAD Y TRANSPORTE PROVINCIAL', descripcion: 'Infraestructura y movilidad rural' },
                { nombre: 'COOPERACIÓN INTERNACIONAL', descripcion: 'Gestión de recursos externos y hermanamientos' },
                { nombre: 'FOMENTO PRODUCTIVO Y AGROPECUARIO', descripcion: 'Impulso a la economía local y seguridad alimentaria' },
                { nombre: 'SISTEMAS DE RIEGO Y DRENAJE', descripcion: 'Infraestructura para la producción agrícola' },
                { nombre: 'RECURSOS NATURALES Y MINERÍA', descripcion: 'Gestión técnica de recursos del subsuelo' },
                { nombre: 'FORTALECIMIENTO INSTITUCIONAL', descripcion: 'Mejora continua y modernización de los GAD' },
            ],
            skipDuplicates: true
        });

        const institucionesArray = [
            ...gremiosList.map(n => ({ nombre: n, tipo: 'GREMIOS', tipoInstitucionId: tid('GREMIOS') })),
            ...entidadesCentralesList.map(n => ({ nombre: n, tipo: 'INSTITUCIÓN — NIVEL CENTRAL', tipoInstitucionId: tid('CENTRAL') })),
            ...cooperantesList.map(n => ({ nombre: n, tipo: 'COOPERANTES', tipoInstitucionId: tid('COOPERANTES') })),
            ...academiaList.map(n => ({ nombre: n, tipo: 'ACADEMIA', tipoInstitucionId: tid('ACADEMIA') })),
            ...privadoList.map(n => ({ nombre: n, tipo: 'PRIVADO', tipoInstitucionId: tid('PRIVADO') })),
            ...ciudadaniaList.map(n => ({ nombre: n, tipo: 'CIUDADANÍA', tipoInstitucionId: tid('CIUDADANÍA') })),
            ...regimenEspecialList.map(n => ({ nombre: n, tipo: 'RÉGIMEN ESPECIAL', tipoInstitucionId: tid('RÉGIMEN ESPECIAL') })),
            // Municipales additions (también se re-aseguran al final del seed con skipDuplicates)
            ...bomberosList.map(n => ({ nombre: n, tipo: 'INSTITUCIÓN — NIVEL MUNICIPAL (CANTONES)', tipoInstitucionId: tid('MUNICIPAL') })),
            ...empresasPublicasList.map(n => ({ nombre: n, tipo: 'INSTITUCIÓN — NIVEL MUNICIPAL (CANTONES)', tipoInstitucionId: tid('MUNICIPAL') })),
            ...registrosPropiedadList.map(n => ({ nombre: n, tipo: 'INSTITUCIÓN — NIVEL MUNICIPAL (CANTONES)', tipoInstitucionId: tid('MUNICIPAL') })),
            ...consejosCantonalesList.map(n => ({ nombre: n, tipo: 'INSTITUCIÓN — NIVEL MUNICIPAL (CANTONES)', tipoInstitucionId: tid('MUNICIPAL') }))
        ];

        await prisma.institucionSistema.createMany({
            data: institucionesArray,
            skipDuplicates: true
        });

        await prisma.mancomunidad.createMany({
            data: mancomunidadesList.map(n => ({ nombre: n }))
        });

        // ============================================
        // STEP 3: GEO DATA
        // ============================================
        console.log('Syncing National Geographic Model (Provinces/Cantons/Parishes)...');
        // 23 provincias (SQL oficial) + cantones/parroquias desde ecuadorData (ver seed-reference-catalogs.ts)
        await seedGeoSqlProvincias(prisma);

        console.log('Loading GAD parroquias catalog (824)...');
        await seedGadParroquias(prisma);

        console.log('Loading educacion_basica catalog (75)...');
        await seedEducacionBasica(prisma);

        // ============================================
        // STEP 4: USERS (Massive & Realistic)
        // ============================================
        console.log('Generating User Ecosystem...');
        const hashedPassword = await bcrypt.hash('AdminPassword123!', SALT_ROUNDS);

        const usersData = [
            // Administrators
            { nombre: 'JORGE DOICELA', ci: '1234567897', email: 'jorge.doicela@cnc.gob.ec', roleId: adminRole.id, authUid: 'admin-01' },
            { nombre: 'KAREN MENDOZA', ci: '1722334453', email: 'karen.mendoza@cnc.gob.ec', roleId: adminRole.id, authUid: 'admin-02' },

            // Conferencistas
            { nombre: 'DR. RICARDO PAZMIÑO', ci: '0911223345', email: 'ricardo.pazmino@capacitacion.ec', roleId: conferencistaRole.id, authUid: 'conf-01' },
            { nombre: 'MAG. ELENA VITERI', ci: '0102030400', email: 'elena.viteri@consultoria.com', roleId: conferencistaRole.id, authUid: 'conf-02' },
            { nombre: 'ING. SEBASTIÁN NOBOA', ci: '1803040502', email: 'snoboa@expertos.org', roleId: conferencistaRole.id, authUid: 'conf-03' },

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
        const generos = await prisma.genero.findMany();
        const etnias = await prisma.etnia.findMany();
        let provinciasList = await prisma.provincia.findMany();

        if (provinciasList.length === 0) {
            console.warn('[seed] Sin provincias tras STEP 3; reintentando geo...');
            await seedGeoSqlProvincias(prisma);
            provinciasList = await prisma.provincia.findMany();
        }

        if (generos.length === 0 || etnias.length === 0) {
            throw new Error('[seed] Faltan géneros o etnias en BD; revisa migraciones y limpieza inicial.');
        }
        if (provinciasList.length === 0) {
            throw new Error('[seed] No hay provincias en BD; no se pueden crear usuarios de prueba.');
        }
        if (provinciasList.length < EXPECTED_PROVINCIAS_SEED) {
            console.warn(
                `[seed] Provincias incompletas (${provinciasList.length}/${EXPECTED_PROVINCIAS_SEED}); los usuarios usarán módulo sobre las existentes.`
            );
        }

        for (const [index, u] of usersData.entries()) {
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
                    tipoParticipanteId: u.roleId === adminRole.id ? tipoAutoridad.id : tipoCiudadano.id,
                    tipoInstitucionId: u.roleId === adminRole.id ? tid('CENTRAL') : tid('CIUDADANÍA'),
                    generoId: generos[index % generos.length].id,
                    etniaId: etnias[index % etnias.length].id,
                    provinciaId: provinciasList[index % provinciasList.length].id,
                    estado: 1
                }
            });
            createdUsers.push(user);
        }

        // ============================================
        // STEP 5: TEMPLATES & TRAINING
        // ============================================
        console.log('Configuring Professional Templates...');
        const defaultTemplateConfig = {
            nombreUsuario: { x: 420, y: 300, fontSize: 32, color: '#1a1a1a' },
            curso: { x: 420, y: 370, fontSize: 18, color: '#333333' },
            fecha: { x: 420, y: 450, fontSize: 14, color: '#666666' }
        };

        const templateStd = await prisma.plantilla.create({
            data: {
                nombre: 'CERTIFICADO INSTITUCIONAL CNC - ESTÁNDAR',
                imagenUrl: '/uploads/plantillas/92850c1d-6ede-4f7c-8bea-020af569ff0c.jpeg',
                configuracion: defaultTemplateConfig,
                activa: true
            }
        });

        const templateExec = await prisma.plantilla.create({
            data: {
                nombre: 'CERTIFICADO DE EXCELENCIA GERENCIAL GAD',
                imagenUrl: '/uploads/plantillas/92850c1d-6ede-4f7c-8bea-020af569ff0c.jpeg',
                configuracion: defaultTemplateConfig,
                activa: false
            }
        });

        console.log('Launching Training Portfolio...');
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
        const mods = ['Presencial', 'Virtual', 'Híbrido'];

        console.log('Seeding Regimenes Especiales...');
        for (const nombre of regimenesEspeciales) {
            try {
                await prisma.regimenEspecial.upsert({
                    where: { nombre },
                    update: {},
                    create: { nombre },
                });
            } catch (e) {
                console.warn(`[seed] regimen_especial upsert omitido para "${nombre}":`, e);
            }
        }
        for (const [index, t] of trainingSessions.entries()) {
            const session = await prisma.capacitacion.create({
                data: {
                    nombre: t.nombre,
                    descripcion: t.descripcion,
                    fechaInicio: t.fechaInicio,
                    fechaFin: t.fechaFin,
                    lugar: t.lugar,
                    cuposDisponibles: t.cupos,
                    modalidad: mods[index % mods.length],
                    estado: t.estado,
                    plantillaId: t.pId,
                    horas: Math.floor(Math.random() * 40) + 5
                }
            });
            createdTrainings.push(session);
        }

        // ============================================
        // STEP 6: REGISTRATIONS & CERTIFICATES (Massive)
        // ============================================
        console.log('Distributing Registrations and Generating Metrics...');

        // Randomly register users to various trainings to populate metrics
        for (const user of createdUsers.slice(5)) { // Only participants
            for (const training of createdTrainings) {
                // 70% probability of registration
                if (Math.random() > 0.3) {
                    try {
                        await prisma.usuarioCapacitacion.create({
                            data: {
                                usuarioId: user.id,
                                capacitacionId: training.id,
                                asistio: training.estado === 'Finalizada',
                                rolCapacitacion: 'Participante',
                                estadoInscripcion: 'Activa'
                            }
                        });
                    } catch (e) {
                        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                            continue;
                        }
                        throw e;
                    }

                    // If training is finished and user assisted, generate certificate
                    if (training.estado === 'Finalizada') {
                        try {
                            await prisma.certificado.create({
                                data: {
                                    usuarioId: user.id,
                                    capacitacionId: training.id,
                                    codigoQR: `CERT-${training.id}-${user.id}-${randomUUID()}`,
                                    pdfUrl: `/certificates/cert_${training.id}_${user.id}.pdf`
                                }
                            });
                        } catch (e) {
                            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                                continue;
                            }
                            throw e;
                        }
                    }
                }
            }
        }

        console.log('\nFINAL PRODUCT DATA LOADED SUCCESSFULLY');
        console.log('System ready for Presentation and Launch.');

    } catch (error) {
        seedFailed = true;
        console.error('Error during launch seeding:', error);
    } finally {
        try {
            // Siempre: bomberos + empresas públicas + registros (idempotente por nombre único)
            await ensureMunicipalInstitucionesSistema(prisma);
        } catch (e) {
            console.error('[seed] No se pudieron asegurar instituciones municipales en BD:', e);
        }
        try {
            const nGad = await prisma.gadParroquia.count().catch(() => -1);
            if (nGad >= 0 && nGad < 800) {
                console.log('[seed] Catálogo gad_parroquias incompleto; recargando desde JSON...');
                await seedGadParroquias(prisma);
            }
        } catch (e) {
            console.warn('[seed] No se pudo verificar catálogo gad_parroquias:', e);
        }
        try {
            const nEb = await prisma.educacionBasica.count().catch(() => -1);
            if (nEb >= 0 && nEb < 70) {
                console.log('[seed] Catálogo educacion_basica incompleto; recargando...');
                await seedEducacionBasica(prisma);
            }
        } catch (e) {
            console.warn('[seed] No se pudo verificar catálogo educacion_basica:', e);
        }
        try {
            const nProv = await prisma.provincia.count().catch(() => -1);
            const nUsers = await prisma.usuario.count().catch(() => -1);

            if (nProv === 0) {
                console.log('[seed] Sin provincias en BD; sincronizando geo (23 provincias + cantones/parroquias)...');
                await seedGeoSqlProvincias(prisma);
                await seedGadParroquias(prisma);
                await seedEducacionBasica(prisma);
            } else if (
                nProv > 0 &&
                nProv < EXPECTED_PROVINCIAS_SEED &&
                nUsers === 0
            ) {
                console.log(
                    `[seed] Geo incompleto (${nProv}/${EXPECTED_PROVINCIAS_SEED}) y sin usuarios; reiniciando catálogo geográfico...`
                );
                await safeDeleteMany('parroquias (repair)', () => prisma.parroquia.deleteMany());
                await safeDeleteMany('cantones (repair)', () => prisma.canton.deleteMany());
                await safeDeleteMany('provincias (repair)', () => prisma.provincia.deleteMany());
                await seedGeoSqlProvincias(prisma);
            }
        } catch (e) {
            console.warn('[seed] No se pudo verificar/rellenar catálogo geográfico:', e);
        }
        await prisma.$disconnect();
    }

    if (seedFailed) {
        process.exit(1);
    }
}

main();
