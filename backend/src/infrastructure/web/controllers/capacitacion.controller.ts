import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateCapacitacionUseCase } from '../../../application/capacitacion/use-cases/create-capacitacion.use-case';
import { GetAllCapacitacionesUseCase } from '../../../application/capacitacion/use-cases/get-all-capacitaciones.use-case';
import { UpdateCapacitacionUseCase } from '../../../application/capacitacion/use-cases/update-capacitacion.use-case';
import { GetCapacitacionByIdUseCase } from '../../../application/capacitacion/use-cases/get-capacitacion-by-id.use-case';
import { DeleteCapacitacionUseCase } from '../../../application/capacitacion/use-cases/delete-capacitacion.use-case';
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
        @inject(CreateCapacitacionUseCase) private createUseCase: CreateCapacitacionUseCase,
        @inject(GetAllCapacitacionesUseCase) private getAllUseCase: GetAllCapacitacionesUseCase,
        @inject(GetCapacitacionByIdUseCase) private getByIdUseCase: GetCapacitacionByIdUseCase,
        @inject(UpdateCapacitacionUseCase) private updateUseCase: UpdateCapacitacionUseCase,
        @inject(DeleteCapacitacionUseCase) private deleteUseCase: DeleteCapacitacionUseCase
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

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const capacitacion = await this.getByIdUseCase.execute(id);
            if (!capacitacion) {
                res.status(404).json({ error: 'Capacitación no encontrada' });
                return;
            }
            res.json(capacitacion);
        } catch (error) {
            next(error);
        }
    };

    count = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const capacitaciones = await this.getAllUseCase.execute();
            res.json({ count: capacitaciones.length });
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
