import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreatePlantillaUseCase } from '../../../application/plantilla/use-cases/create-plantilla.use-case';
import { GetAllPlantillasUseCase } from '../../../application/plantilla/use-cases/get-all-plantillas.use-case';
import { GetPlantillaByIdUseCase } from '../../../application/plantilla/use-cases/get-plantilla-by-id.use-case';
import { UpdatePlantillaUseCase } from '../../../application/plantilla/use-cases/update-plantilla.use-case';
import { DeletePlantillaUseCase } from '../../../application/plantilla/use-cases/delete-plantilla.use-case';
import { ActivarPlantillaUseCase } from '../../../application/plantilla/use-cases/activar-plantilla.use-case';
import { parseIdParam } from '../middleware/parse-id.helper';
import { NotFoundError } from '../../../domain/shared/errors';
import { z } from 'zod';

const plantillaSchema = z.object({
    nombre: z.string().min(3, 'El nombre es obligatorio'),
    imagenUrl: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
    configuracion: z.record(z.any()).optional(),
    activa: z.boolean().optional()
});

@injectable()
export class PlantillaController {
    constructor(
        @inject(CreatePlantillaUseCase) private createPlantillaUseCase: CreatePlantillaUseCase,
        @inject(GetAllPlantillasUseCase) private getAllPlantillasUseCase: GetAllPlantillasUseCase,
        @inject(GetPlantillaByIdUseCase) private getPlantillaByIdUseCase: GetPlantillaByIdUseCase,
        @inject(UpdatePlantillaUseCase) private updatePlantillaUseCase: UpdatePlantillaUseCase,
        @inject(DeletePlantillaUseCase) private deletePlantillaUseCase: DeletePlantillaUseCase,
        @inject(ActivarPlantillaUseCase) private activarPlantillaUseCase: ActivarPlantillaUseCase
    ) { }

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = plantillaSchema.parse(req.body);
            const plantilla = await this.createPlantillaUseCase.execute(data);
            res.status(201).json(plantilla);
        } catch (error) {
            next(error);
        }
    };

    getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const plantillas = await this.getAllPlantillasUseCase.execute();
            res.json(plantillas);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const plantilla = await this.getPlantillaByIdUseCase.execute(id);
            if (!plantilla) throw new NotFoundError('Plantilla no encontrada');
            res.json(plantilla);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const data = plantillaSchema.parse(req.body);
            const plantilla = await this.updatePlantillaUseCase.execute(id, data);
            res.json(plantilla);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            await this.deletePlantillaUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    activar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const plantilla = await this.activarPlantillaUseCase.execute(id);
            res.json(plantilla);
        } catch (error) {
            next(error);
        }
    };
}
