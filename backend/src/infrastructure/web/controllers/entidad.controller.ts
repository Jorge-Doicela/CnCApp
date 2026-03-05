import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllEntidadesUseCase } from '../../../application/user/use-cases/get-all-entidades.use-case';
import { GetEntidadByIdUseCase } from '../../../application/user/use-cases/get-entidad-by-id.use-case';
import { CreateEntidadUseCase } from '../../../application/user/use-cases/create-entidad.use-case';
import { UpdateEntidadUseCase } from '../../../application/user/use-cases/update-entidad.use-case';
import { DeleteEntidadUseCase } from '../../../application/user/use-cases/delete-entidad.use-case';
import { parseIdParam } from '../middleware/parse-id.helper';
import { NotFoundError } from '../../../domain/shared/errors';
import { z } from 'zod';

const createEntidadSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    estado: z.boolean().optional()
});

const updateEntidadSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    estado: z.boolean().optional()
});

@injectable()
export class EntidadController {
    constructor(
        @inject(GetAllEntidadesUseCase) private getAllEntidadesUseCase: GetAllEntidadesUseCase,
        @inject(GetEntidadByIdUseCase) private getEntidadByIdUseCase: GetEntidadByIdUseCase,
        @inject(CreateEntidadUseCase) private createEntidadUseCase: CreateEntidadUseCase,
        @inject(UpdateEntidadUseCase) private updateEntidadUseCase: UpdateEntidadUseCase,
        @inject(DeleteEntidadUseCase) private deleteEntidadUseCase: DeleteEntidadUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const entidades = await this.getAllEntidadesUseCase.execute();
            res.json(entidades);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const entidad = await this.getEntidadByIdUseCase.execute(id);
            if (!entidad) throw new NotFoundError('Entidad no encontrada');
            res.json(entidad);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = createEntidadSchema.parse(req.body);
            const entidad = await this.createEntidadUseCase.execute(data);
            res.status(201).json(entidad);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const data = updateEntidadSchema.parse(req.body);
            const entidad = await this.updateEntidadUseCase.execute(id, data);
            res.json(entidad);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            await this.deleteEntidadUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
