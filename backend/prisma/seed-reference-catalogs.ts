import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PrismaClient } from '@prisma/client';
import { ecuadorData } from './data/ecuador-data';
import { resolverNombreCantonOficial } from './data/gad-canton-nombres-oficiales';
import {
    bomberosList,
    empresasPublicasList,
    registrosPropiedadList
} from './data/form-options-index';
import { educacionBasicaList } from './data/form-options-educacion';

/** Mismo texto que usa el seed principal para instituciones municipales (bomberos, EP, registros). */
export const TIPO_INSTITUCION_MUNICIPAL_CANTONES = 'INSTITUCIÓN — NIVEL MUNICIPAL (CANTONES)';

/** 23 provincias alineadas al SQL oficial (sin Galápagos). */
export const SQL_PROVINCIAS = [
    'AZUAY',
    'BOLÍVAR',
    'CAÑAR',
    'CARCHI',
    'CHIMBORAZO',
    'COTOPAXI',
    'EL ORO',
    'ESMERALDAS',
    'GUAYAS',
    'IMBABURA',
    'LOJA',
    'LOS RÍOS',
    'MANABÍ',
    'MORONA SANTIAGO',
    'NAPO',
    'ORELLANA',
    'PASTAZA',
    'PICHINCHA',
    'SANTA ELENA',
    'SANTO DOMINGO DE LOS TSÁCHILAS',
    'SUCUMBÍOS',
    'TUNGURAHUA',
    'ZAMORA CHINCHIPE'
] as const;

function normalizeProvincia(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Carga provincias (23) + cantones + parroquias desde ecuadorData.
 * Debe ejecutarse tras vaciar parroquias/cantones/provincias (p. ej. en seed completo).
 */
export async function seedGeoSqlProvincias(prisma: PrismaClient): Promise<void> {
    const allowedProvNormalized = new Set(SQL_PROVINCIAS.map(normalizeProvincia));

    const targetNombreMap = new Map<string, string>([
        [normalizeProvincia('BOLIVAR'), 'BOLÍVAR'],
        [normalizeProvincia('LOS RIOS'), 'LOS RÍOS'],
        [normalizeProvincia('MANABI'), 'MANABÍ'],
        [normalizeProvincia('SUCUMBIOS'), 'SUCUMBÍOS'],
        [normalizeProvincia('SANTO DOMINGO DE LOS TSACHILAS'), 'SANTO DOMINGO DE LOS TSÁCHILAS']
    ]);

    for (const prov of ecuadorData) {
        const provNormalized = normalizeProvincia(prov.provincia);
        if (!allowedProvNormalized.has(provNormalized)) continue;

        const targetNombre = targetNombreMap.get(provNormalized) ?? prov.provincia;
        const createdProv = await prisma.provincia.create({
            data: { nombre: targetNombre }
        });

        for (const cant of prov.cantones) {
            const nombreOficial = resolverNombreCantonOficial(prov.provincia, cant.nombre);
            const createdCant = await prisma.canton.create({
                data: {
                    nombre: nombreOficial,
                    provinciaId: createdProv.id
                }
            });

            if (cant.parroquias && cant.parroquias.length > 0) {
                await prisma.parroquia.createMany({
                    data: cant.parroquias.map((p) => ({
                        nombre: p,
                        cantonId: createdCant.id
                    }))
                });
            }
        }
    }
}

/**
 * Idempotente: inserta bomberos + empresas públicas + registros si faltan (nombre único en instituciones_sistema).
 * Ejecutar al final del seed o tras migraciones para que siempre existan en BD.
 */
export async function ensureMunicipalInstitucionesSistema(prisma: PrismaClient): Promise<void> {
    const data = [
        ...bomberosList.map((nombre) => ({ nombre, tipo: TIPO_INSTITUCION_MUNICIPAL_CANTONES })),
        ...empresasPublicasList.map((nombre) => ({ nombre, tipo: TIPO_INSTITUCION_MUNICIPAL_CANTONES })),
        ...registrosPropiedadList.map((nombre) => ({ nombre, tipo: TIPO_INSTITUCION_MUNICIPAL_CANTONES }))
    ];

    const result = await prisma.institucionSistema.createMany({
        data,
        skipDuplicates: true
    });

    console.log(
        `[seed] Instituciones municipales (bomberos/EP/registros) aseguradas — nuevas insertadas: ${result.count}`
    );
}

/**
 * Catálogo plano oficial GAD (824 parroquias; pueden repetirse nombres).
 * Fuente: prisma/data/gad-parroquias.json (generar con prisma/tools/parse-gad-parroquias-sql.mjs).
 */
export async function seedGadParroquias(prisma: PrismaClient): Promise<void> {
    const jsonPath = path.join(__dirname, 'data', 'gad-parroquias.json');
    if (!fs.existsSync(jsonPath)) {
        console.warn('[seed] gad-parroquias.json no encontrado; omitiendo catálogo GAD parroquias.');
        return;
    }
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const nombres = JSON.parse(raw) as string[];
    if (!Array.isArray(nombres) || nombres.length === 0) {
        console.warn('[seed] gad-parroquias.json vacío o inválido.');
        return;
    }
    await prisma.$transaction(async (tx) => {
        await tx.usuario.updateMany({ data: { gadParroquiaId: null } });
        await tx.gadParroquia.deleteMany({});
        const batch = 500;
        for (let i = 0; i < nombres.length; i += batch) {
            const slice = nombres.slice(i, i + batch).map((nombre) => ({ nombre }));
            await tx.gadParroquia.createMany({ data: slice });
        }
    });
    console.log(`[seed] gad_parroquias cargadas: ${nombres.length} registros`);
}

/**
 * Catálogo educación básica (75 filas; pueden repetirse nombres).
 * Elimina vínculos en instituciones_usuario que apunten a educacion_basica y recrea el catálogo.
 */
export async function seedEducacionBasica(prisma: PrismaClient): Promise<void> {
    const nombres = [...educacionBasicaList];
    await prisma.$transaction(async (tx) => {
        await tx.institucionUsuario.deleteMany({ where: { educacionBasicaId: { not: null } } });
        await tx.educacionBasica.deleteMany({});
        const batch = 200;
        for (let i = 0; i < nombres.length; i += batch) {
            const slice = nombres.slice(i, i + batch).map((nombre) => ({ nombre }));
            await tx.educacionBasica.createMany({ data: slice });
        }
    });
    console.log(`[seed] educacion_basica cargadas: ${nombres.length} registros`);
}
