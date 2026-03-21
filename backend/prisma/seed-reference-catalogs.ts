import type { PrismaClient } from '@prisma/client';
import { ecuadorData } from './data/ecuador-data';
import { resolverNombreCantonOficial } from './data/gad-canton-nombres-oficiales';
import {
    bomberosList,
    empresasPublicasList,
    registrosPropiedadList
} from './data/form-options-index';

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
