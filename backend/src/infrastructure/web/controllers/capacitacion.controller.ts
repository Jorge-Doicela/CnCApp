import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { CreateCapacitacionUseCase } from '../../../application/use-cases/create-capacitacion.use-case';
import { GetAllCapacitacionesUseCase } from '../../../application/use-cases/get-all-capacitaciones.use-case';
import { UpdateCapacitacionUseCase } from '../../../application/use-cases/update-capacitacion.use-case';
import { DeleteCapacitacionUseCase } from '../../../application/use-cases/delete-capacitacion.use-case';
import { z } from 'zod';

const capacitacionSchema = z.object({
    nombre: z.string().min(3, 'El nombre es obligatorio'),
    descripcion: z.string().optional(),
    fechaInicio: z.string().or(z.date()).optional().transform(str => str ? new Date(str) : undefined),
    fechaFin: z.string().or(z.date()).optional().transform(str => str ? new Date(str) : undefined),
    lugar: z.string().optional(),
    cuposDisponibles: z.number().int().min(0).optional(),
    modalidad: z.string().optional(),
    estado: z.string().optional()
});

@injectable()
export class CapacitacionController {
    constructor(
        private createUseCase: CreateCapacitacionUseCase,
        private getAllUseCase: GetAllCapacitacionesUseCase,
        private updateUseCase: UpdateCapacitacionUseCase,
        private deleteUseCase: DeleteCapacitacionUseCase
    ) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = capacitacionSchema.parse(req.body);
            const capacitacion = await this.createUseCase.execute(data);
            res.status(201).json(capacitacion);
        } catch (error) {
            next(error);
        }
    };

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const capacitaciones = await this.getAllUseCase.execute();
            res.json(capacitaciones);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const data = capacitacionSchema.parse(req.body);
            const capacitacion = await this.updateUseCase.execute(id, data);
            res.json(capacitacion);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            await this.deleteUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
