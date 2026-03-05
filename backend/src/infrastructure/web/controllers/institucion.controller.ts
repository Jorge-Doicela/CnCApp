import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllInstitucionesUseCase } from '../../../application/institucion/use-cases/get-all-instituciones.use-case';
import { GetInstitucionByIdUseCase } from '../../../application/institucion/use-cases/get-institucion-by-id.use-case';
import { CreateInstitucionUseCase } from '../../../application/institucion/use-cases/create-institucion.use-case';
import { UpdateInstitucionUseCase } from '../../../application/institucion/use-cases/update-institucion.use-case';
import { DeleteInstitucionUseCase } from '../../../application/institucion/use-cases/delete-institucion.use-case';
import { parseIdParam } from '../middleware/parse-id.helper';
import { NotFoundError } from '../../../domain/shared/errors';
import { z } from 'zod';

// Institución tiene campo 'tipo' adicional, por eso mantiene su propio controller
const createInstitucionSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    tipo: z.string().optional().nullable()
});

const updateInstitucionSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    tipo: z.string().optional().nullable()
});

@injectable()
export class InstitucionController {
    constructor(
        @inject(GetAllInstitucionesUseCase) private getAllUseCase: GetAllInstitucionesUseCase,
        @inject(GetInstitucionByIdUseCase) private getByIdUseCase: GetInstitucionByIdUseCase,
        @inject(CreateInstitucionUseCase) private createUseCase: CreateInstitucionUseCase,
        @inject(UpdateInstitucionUseCase) private updateUseCase: UpdateInstitucionUseCase,
        @inject(DeleteInstitucionUseCase) private deleteUseCase: DeleteInstitucionUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const instituciones = await this.getAllUseCase.execute();
            res.json(instituciones);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const institucion = await this.getByIdUseCase.execute(id);
            if (!institucion) throw new NotFoundError('Institución no encontrada');
            res.json(institucion);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = createInstitucionSchema.parse(req.body);
            const institucion = await this.createUseCase.execute(data);
            res.status(201).json(institucion);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const data = updateInstitucionSchema.parse(req.body);
            const institucion = await this.updateUseCase.execute(id, data);
            res.json(institucion);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            await this.deleteUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
