import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
    cargosList, gremiosList,
    entidadesCentralesList, otrasInstitucionesEstadoList, cooperantesList, academiaList,
    privadoList, ciudadaniaList,
    regimenEspecialList, mancomunidadesList,
    bomberosList, empresasPublicasList,
    registrosPropiedadList, consejosCantonalesList, juntasCantonalesList,
    provinciasInstitucionesList, cantonesInstitucionesList, parroquiasInstitucionesList
} from './data/form-options-index';
import {
    ensureMunicipalInstitucionesSistema,
    seedGeoSqlProvincias,
    seedGadParroquias,
    seedEducacionBasica
} from './seed-reference-catalogs';
import { syncGeneroEtniaCatalogs } from './seed-sync-genero-etnia';
import { generateEcuadorianID } from './tools/ecuador-id.utils';

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
    'GOBIERNO CENTRAL',
    'OTRAS INSTITUCIONES DEL ESTADO',
    'COOPERANTES',
    'ACADEMIA',
    'EDUCACIÓN GENERAL BÁSICA Y BACHILLERATO',
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

        await syncGeneroEtniaCatalogs(prisma);

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
        const categoriasEntidad = [
            { nombre: 'PROVINCIAL', codigo: 'NIVEL_PROVINCIAL' },
            { nombre: 'MUNICIPAL', codigo: 'NIVEL_MUNICIPAL' },
            { nombre: 'PARROQUIAL RURAL', codigo: 'NIVEL_PARROQUIAL' },
            { nombre: 'GREMIOS', codigo: 'GREMIOS' },
            { nombre: 'GOBIERNO CENTRAL', codigo: 'NIVEL_CENTRAL' },
            { nombre: 'OTRAS INSTITUCIONES DEL ESTADO', codigo: 'OTRAS' },
            { nombre: 'COOPERANTES', codigo: 'COOPERANTES' },
            { nombre: 'ACADEMIA', codigo: 'ACADEMIA' },
            { nombre: 'EDUCACIÓN GENERAL BÁSICA Y BACHILLERATO', codigo: 'EDUCACION' },
            { nombre: 'CIUDADANÍA', codigo: 'CIUDADANIA' },
            { nombre: 'MANCOMUNIDADES Y CONSORCIOS', codigo: 'MANCOMUNIDADES' },
            { nombre: 'RÉGIMEN ESPECIAL', codigo: 'REGIMEN_ESPECIAL' }
        ];

        for (const cat of categoriasEntidad) {
            await prisma.entidad.upsert({
                where: { codigo: cat.codigo },
                update: { nombre: cat.nombre },
                create: cat
            });
        }

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
            ...entidadesCentralesList.map(n => ({ nombre: n, tipo: 'GOBIERNO CENTRAL', tipoInstitucionId: tid('GOBIERNO CENTRAL') })),
            ...otrasInstitucionesEstadoList.map((n) => ({
                nombre: n,
                tipo: 'OTRAS INSTITUCIONES DEL ESTADO',
                tipoInstitucionId: tid('OTRAS INSTITUCIONES DEL ESTADO')
            })),
            ...cooperantesList.map(n => ({ nombre: n, tipo: 'COOPERANTES', tipoInstitucionId: tid('COOPERANTES') })),
            ...academiaList.map(n => ({ nombre: n, tipo: 'ACADEMIA', tipoInstitucionId: tid('ACADEMIA') })),
            ...ciudadaniaList.map(n => ({ nombre: n, tipo: 'CIUDADANÍA', tipoInstitucionId: tid('CIUDADANÍA') })),
            ...regimenEspecialList.map(n => ({ nombre: n, tipo: 'RÉGIMEN ESPECIAL', tipoInstitucionId: tid('RÉGIMEN ESPECIAL') })),
            // Municipales additions (también se re-aseguran al final del seed con skipDuplicates)
            ...bomberosList.map(n => ({ nombre: n, tipo: 'MUNICIPAL', tipoInstitucionId: tid('MUNICIPAL') })),
            ...empresasPublicasList.map(n => ({ nombre: n, tipo: 'MUNICIPAL', tipoInstitucionId: tid('MUNICIPAL') })),
            ...registrosPropiedadList.map(n => ({ nombre: n, tipo: 'MUNICIPAL', tipoInstitucionId: tid('MUNICIPAL') })),
            ...consejosCantonalesList.map(n => ({ nombre: n, tipo: 'MUNICIPAL', tipoInstitucionId: tid('MUNICIPAL') })),
            ...juntasCantonalesList.map(n => ({ nombre: n, tipo: 'MUNICIPAL', tipoInstitucionId: tid('MUNICIPAL') })),
            // GADs Provinciales, Municipales (Presenciales) y Parroquiales
            ...provinciasInstitucionesList.map(n => ({ nombre: n, tipo: 'PROVINCIAL', tipoInstitucionId: tid('PROVINCIAL') })),
            ...cantonesInstitucionesList.map(n => ({ nombre: n, tipo: 'MUNICIPAL', tipoInstitucionId: tid('MUNICIPAL') })),
            ...parroquiasInstitucionesList.map(n => ({ nombre: n, tipo: 'PARROQUIAL RURAL', tipoInstitucionId: tid('PARROQUIAL RURAL') })),
            ...mancomunidadesList.map(n => ({ nombre: n, tipo: 'MANCOMUNIDADES Y CONSORCIOS', tipoInstitucionId: tid('MANCOMUNIDADES Y CONSORCIOS') }))
        ];

        await prisma.institucionSistema.createMany({
            data: institucionesArray,
            skipDuplicates: true
        });

        await prisma.mancomunidad.createMany({
            data: mancomunidadesList.map(n => ({ nombre: n })),
            skipDuplicates: true
        });
        await prisma.regimenEspecial.createMany({
            data: regimenEspecialList.map(n => ({ nombre: n })),
            skipDuplicates: true
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
        const defaultSeedPassword = process.env.INITIAL_ADMIN_PASSWORD || 'AdminPassword123!';
        const hashedPassword = await bcrypt.hash(defaultSeedPassword, SALT_ROUNDS);

        const usersData = [
            // Root System Administrator
            { 
                nombre: 'ADMINISTRADOR DEL SISTEMA', 
                ci: '1700000000', 
                email: 'admin@cnc.gob.ec', 
                password: defaultSeedPassword, // Change this in production
                roleId: adminRole.id, 
                authUid: 'admin-root' 
            }
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

        for (const u of usersData) {
            const hashedPasswordForUser = await bcrypt.hash(u.password, SALT_ROUNDS);
            await prisma.usuario.upsert({
                where: { ci: u.ci },
                update: {
                    rolId: u.roleId,
                    email: u.email,
                    estado: 1
                },
                create: {
                    nombre: u.nombre,
                    primerNombre: u.nombre.split(' ')[0],
                    primerApellido: u.nombre.split(' ').slice(1).join(' '),
                    ci: u.ci,
                    email: u.email,
                    password: hashedPasswordForUser,
                    rolId: u.roleId,
                    authUid: u.authUid,
                    tipoParticipanteId: tipoAutoridad.id,
                    tipoInstitucionId: tid('INSTITUCIÓN — NIVEL CENTRAL'),
                    generoId: generos[0].id,
                    etniaId: etnias[0].id,
                    provinciaId: provinciasList[0].id,
                    estado: 1
                }
            });
        }

        // ============================================
        // STEP 5: CLEAN PRESENTATION (No dummy trainings)
        // ============================================
        console.log('\nFINAL PRODUCT DATA LOADED SUCCESSFULLY');
        console.log('System ready for Presentation (Catalogs loaded, Super Admin created).');

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
                    `[seed] Geo incompleto (${nProv}/${EXPECTED_PROVINCIAS_SEED}) y sin usuarios; intentando completar catálogo...`
                );
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
