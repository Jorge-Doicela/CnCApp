import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { SimpleEntityService } from '../../../application/shared/simple-entity.service';
import { SimpleEntity } from '../../../domain/shared/repositories/simple-entity.repository';

/**
 * Schema por defecto para entidades simples con solo un campo "nombre".
 * Los controladores concretos pueden sobreescribir este schema si necesitan
 * validaciones adicionales (ej: Institución que tiene "tipo" extra).
 */
export const simpleEntitySchema = z.object({
    nombre: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(200, 'El nombre es demasiado largo')
        .trim()
});

export type SimpleEntityInput = z.infer<typeof simpleEntitySchema>;

/**
 * Controlador genérico para entidades simples (id + nombre).
 * Reemplaza los controllers duplicados de Cargo, GradoOcupacional, Mancomunidad.
 * 
 * Delega toda lógica al SimpleEntityService, delegando errores al middleware
 * global de errores (errorHandler) mediante next(error).
 */
export class SimpleEntityController<T extends SimpleEntity = SimpleEntity> {
    constructor(
        private readonly service: SimpleEntityService<T>,
        private readonly schema: ZodSchema = simpleEntitySchema
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const items = await this.service.getAll();
            res.json(items);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = this.parseId(req, res);
            if (id === null) return;
            const item = await this.service.getById(id);
            res.json(item);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = this.schema.parse(req.body) as SimpleEntityInput;
            const item = await this.service.create(data.nombre);
            res.status(201).json(item);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = this.parseId(req, res);
            if (id === null) return;
            const data = this.schema.parse(req.body) as SimpleEntityInput;
            const item = await this.service.update(id, data.nombre);
            res.json(item);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = this.parseId(req, res);
            if (id === null) return;
            await this.service.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    /**
     * Parsea y valida el parámetro :id, respondiendo 400 si es inválido.
     * Retorna null si ya respondió con error.
     */
    private parseId(req: Request, res: Response): number | null {
        const id = parseInt(req.params['id'] as string, 10);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ message: 'ID inválido' });
            return null;
        }
        return id;
    }
}
