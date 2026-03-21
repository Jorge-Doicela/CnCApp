import type { PrismaClient } from '@prisma/client';
import { etniaList, generoList } from './data/form-options-index';

/**
 * Valores del seed antiguo → nombres canónicos actuales (SQL / form-options-small).
 * Ejecutar migración antes de borrar filas de catálogo.
 */
export const LEGACY_GENERO_NOMBRE_MAP: Record<string, string> = {
    Masculino: 'HOMBRE',
    Femenino: 'MUJER',
    MASCULINO: 'HOMBRE',
    FEMENINO: 'MUJER',
    masculino: 'HOMBRE',
    femenino: 'MUJER'
};

export const LEGACY_ETNIA_NOMBRE_MAP: Record<string, string> = {
    Mestizo: 'MESTIZO',
    Afroecuatoriano: 'AFROECUATORIANO',
    Montubio: 'MONTUBIO',
    Indígena: 'INDÍGENA',
    Blanco: 'BLANCO',
    Otro: 'OTRO',
    MESTIZO: 'MESTIZO',
    AFROECUATORIANO: 'AFROECUATORIANO',
    MONTUBIO: 'MONTUBIO',
    INDÍGENA: 'INDÍGENA',
    INDIGENA: 'INDÍGENA',
    BLANCO: 'BLANCO',
    OTRO: 'OTRO'
};

function allowedGeneros(): Set<string> {
    return new Set([...generoList]);
}

function allowedEtnias(): Set<string> {
    return new Set([...etniaList]);
}

async function migrateGeneroNombre(
    prisma: PrismaClient,
    legacyNombre: string,
    canonicalNombre: string,
    log: (msg: string) => void
): Promise<void> {
    const oldRow = await prisma.genero.findUnique({ where: { nombre: legacyNombre } });
    if (!oldRow) return;

    const newRow = await prisma.genero.findUnique({ where: { nombre: canonicalNombre } });
    if (!newRow) {
        throw new Error(`[sync género] Falta fila canónica "${canonicalNombre}" (upsert previo falló).`);
    }
    if (oldRow.id === newRow.id) return;

    const updated = await prisma.usuario.updateMany({
        where: { generoId: oldRow.id },
        data: { generoId: newRow.id }
    });
    await prisma.genero.delete({ where: { id: oldRow.id } });
    if (updated.count > 0) {
        log(`[sync] Género: ${updated.count} usuario(s) ${legacyNombre} → ${canonicalNombre}`);
    }
}

async function migrateEtniaNombre(
    prisma: PrismaClient,
    legacyNombre: string,
    canonicalNombre: string,
    log: (msg: string) => void
): Promise<void> {
    const oldRow = await prisma.etnia.findUnique({ where: { nombre: legacyNombre } });
    if (!oldRow) return;

    const newRow = await prisma.etnia.findUnique({ where: { nombre: canonicalNombre } });
    if (!newRow) {
        throw new Error(`[sync etnia] Falta fila canónica "${canonicalNombre}" (upsert previo falló).`);
    }
    if (oldRow.id === newRow.id) return;

    const updated = await prisma.usuario.updateMany({
        where: { etniaId: oldRow.id },
        data: { etniaId: newRow.id }
    });
    await prisma.etnia.delete({ where: { id: oldRow.id } });
    if (updated.count > 0) {
        log(`[sync] Etnia: ${updated.count} usuario(s) ${legacyNombre} → ${canonicalNombre}`);
    }
}

/**
 * Asegura géneros y etnias canónicos, reasigna usuarios desde nombres legados y elimina
 * filas de catálogo huérfanas (sin usuarios) que ya no estén en la lista oficial.
 */
export async function syncGeneroEtniaCatalogs(
    prisma: PrismaClient,
    options?: { verbose?: boolean }
): Promise<void> {
    const log = options?.verbose ? (m: string) => console.log(m) : () => {};

    const gAllowed = allowedGeneros();
    const eAllowed = allowedEtnias();

    for (const nombre of generoList) {
        await prisma.genero.upsert({
            where: { nombre },
            update: {},
            create: { nombre }
        });
    }

    for (const nombre of etniaList) {
        await prisma.etnia.upsert({
            where: { nombre },
            update: {},
            create: { nombre }
        });
    }

    for (const [legacy, canonical] of Object.entries(LEGACY_GENERO_NOMBRE_MAP)) {
        await migrateGeneroNombre(prisma, legacy, canonical, log);
    }

    for (const [legacy, canonical] of Object.entries(LEGACY_ETNIA_NOMBRE_MAP)) {
        await migrateEtniaNombre(prisma, legacy, canonical, log);
    }

    const generosExtra = await prisma.genero.findMany({
        where: { nombre: { notIn: [...gAllowed] } }
    });
    for (const row of generosExtra) {
        const n = await prisma.usuario.count({ where: { generoId: row.id } });
        if (n === 0) {
            await prisma.genero.delete({ where: { id: row.id } });
            log(`[sync] Género eliminado (huérfano): "${row.nombre}"`);
        } else {
            console.warn(
                `[sync] Género "${row.nombre}" no está en el catálogo oficial pero tiene ${n} usuario(s); no se elimina.`
            );
        }
    }

    const etniasExtra = await prisma.etnia.findMany({
        where: { nombre: { notIn: [...eAllowed] } }
    });
    for (const row of etniasExtra) {
        const n = await prisma.usuario.count({ where: { etniaId: row.id } });
        if (n === 0) {
            await prisma.etnia.delete({ where: { id: row.id } });
            log(`[sync] Etnia eliminada (huérfana): "${row.nombre}"`);
        } else {
            console.warn(
                `[sync] Etnia "${row.nombre}" no está en el catálogo oficial pero tiene ${n} usuario(s); no se elimina.`
            );
        }
    }
}
