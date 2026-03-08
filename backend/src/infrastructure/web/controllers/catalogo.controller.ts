import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';

type PrismaQueryFn = () => Promise<any[]>;

/**
 * Helper interno: ejecuta una consulta Prisma de solo lectura y maneja errores.
 * Reemplaza el bloque try/catch repetido 9 veces en el controlador original.
 */
async function query(
    res: Response,
    next: NextFunction,
    fn: PrismaQueryFn
): Promise<void> {
    try {
        const result = await fn();
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * Controlador de catálogos de solo lectura (datos de referencia).
 * Estos endpoints son PÚBLICOS (sin autenticación) y solo retornan listas.
 *
 * Nota: Para CRUD completo de estos catálogos ver los routes protegidos:
 *  - /api/cargos         → cargo.routes.ts
 *  - /api/grados-ocupacionales → grado-ocupacional.routes.ts
 */
export class CatalogoController {
    getGeneros = async (_req: Request, res: Response, next: NextFunction) =>
        query(res, next, () => prisma.genero.findMany({ orderBy: { id: 'asc' } }));

    getEtnias = async (_req: Request, res: Response, next: NextFunction) =>
        query(res, next, () => prisma.etnia.findMany({ orderBy: { id: 'asc' } }));

    getTiposParticipante = async (_req: Request, res: Response, next: NextFunction) =>
        query(res, next, () => prisma.tipoParticipante.findMany({ orderBy: { id: 'asc' } }));

    getNacionalidades = async (_req: Request, res: Response, next: NextFunction) =>
        query(res, next, () => prisma.nacionalidad.findMany({ orderBy: { id: 'asc' } }));

    getCargos = async (_req: Request, res: Response, next: NextFunction) =>
        query(res, next, () => prisma.cargo.findMany({ orderBy: { nombre: 'asc' } }));

    getEntidades = async (_req: Request, res: Response, next: NextFunction) =>
        query(res, next, () => prisma.entidad.findMany({ orderBy: { id: 'asc' } }));

    getInstituciones = async (_req: Request, res: Response, next: NextFunction) =>
        query(res, next, () => prisma.institucionSistema.findMany({ orderBy: { nombre: 'asc' } }));

    getMancomunidades = async (_req: Request, res: Response, next: NextFunction) =>
        query(res, next, () => prisma.mancomunidad.findMany({ orderBy: { nombre: 'asc' } }));

    getGradosOcupacionales = async (_req: Request, res: Response, next: NextFunction) =>
        query(res, next, () => prisma.gradoOcupacional.findMany({ orderBy: { nombre: 'asc' } }));

    getCompetencias = async (_req: Request, res: Response, next: NextFunction) =>
        query(res, next, async () => {
            const competencias = await prisma.competencia.findMany({
                where: { estado: true },
                orderBy: { nombre: 'asc' }
            });
            return competencias.map((c: any) => ({ id: c.id, nombre: c.nombre }));
        });
}
