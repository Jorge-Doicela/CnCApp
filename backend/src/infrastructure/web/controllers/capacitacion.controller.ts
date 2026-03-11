import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateCapacitacionUseCase } from '../../../application/capacitacion/use-cases/create-capacitacion.use-case';
import { GetAllCapacitacionesUseCase } from '../../../application/capacitacion/use-cases/get-all-capacitaciones.use-case';
import { UpdateCapacitacionUseCase } from '../../../application/capacitacion/use-cases/update-capacitacion.use-case';
import { GetCapacitacionByIdUseCase } from '../../../application/capacitacion/use-cases/get-capacitacion-by-id.use-case';
import { DeleteCapacitacionUseCase } from '../../../application/capacitacion/use-cases/delete-capacitacion.use-case';
import { CheckNombreCapacitacionUseCase } from '../../../application/capacitacion/use-cases/check-nombre-capacitacion.use-case';
import { parseIdParam } from '../middleware/parse-id.helper';
import { NotFoundError } from '../../../domain/shared/errors';
import { z } from 'zod';
import prisma from '../../../config/database';

const capacitacionSchema = z.object({
    nombre: z.string().min(3, 'El nombre es obligatorio'),
    descripcion: z.string().nullable().optional(),
    tipoEvento: z.string().nullable().optional(),
    fechaInicio: z.string().or(z.date()).nullable().optional().transform(v => v ? new Date(v) : undefined),
    fechaFin: z.string().or(z.date()).nullable().optional().transform(v => v ? new Date(v) : undefined),
    lugar: z.string().nullable().optional(),
    cuposDisponibles: z.number().int().min(0).nullable().optional(),
    modalidad: z.string().nullable().optional(),
    estado: z.string().nullable().optional(),
    plantillaId: z.number().int().nullable().optional(),
    horaInicio: z.string().nullable().optional(),
    horaFin: z.string().nullable().optional(),
    horas: z.number().nullable().optional(),
    enlaceVirtual: z.string().url().or(z.literal('')).nullable().optional(),
    latitud: z.number().nullable().optional(),
    longitud: z.number().nullable().optional(),
    certificado: z.boolean().optional(),
    idsUsuarios: z.array(z.number()).optional(),
    expositores: z.array(z.number()).optional(),
    entidadesEncargadas: z.array(z.number()).optional()
});

// Schema para updates parciales (todos los campos son opcionales)
const updateCapacitacionSchema = capacitacionSchema.partial();

@injectable()
export class CapacitacionController {
    constructor(
        @inject(CreateCapacitacionUseCase) private createUseCase: CreateCapacitacionUseCase,
        @inject(GetAllCapacitacionesUseCase) private getAllUseCase: GetAllCapacitacionesUseCase,
        @inject(GetCapacitacionByIdUseCase) private getByIdUseCase: GetCapacitacionByIdUseCase,
        @inject(UpdateCapacitacionUseCase) private updateUseCase: UpdateCapacitacionUseCase,
        @inject(DeleteCapacitacionUseCase) private deleteUseCase: DeleteCapacitacionUseCase,
        @inject(CheckNombreCapacitacionUseCase) private checkNombreUseCase: CheckNombreCapacitacionUseCase
    ) { }

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = capacitacionSchema.parse(req.body);
            const capacitacion = await this.createUseCase.execute(data);
            res.status(201).json(capacitacion);
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authReq = req as any;
            const isConferencista = authReq.userRoleName === 'Conferencista';
            const expositorId = isConferencista ? authReq.userId : undefined;

            const capacitaciones = await this.getAllUseCase.execute(expositorId);
            res.json(capacitaciones);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const capacitacion = await this.getByIdUseCase.execute(id);
            if (!capacitacion) throw new NotFoundError('Capacitación no encontrada');
            res.json(capacitacion);
        } catch (error) {
            next(error);
        }
    };

    count = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const count = await prisma.capacitacion.count();
            res.json({ count });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const data = updateCapacitacionSchema.parse(req.body);
            const capacitacion = await this.updateUseCase.execute(id, data);
            res.json(capacitacion);
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

    checkNombre = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { nombre, excludeId } = req.query;
            if (!nombre) {
                res.status(400).json({ message: 'El nombre es requerido' });
                return;
            }
            const exists = await this.checkNombreUseCase.execute(nombre as string, excludeId ? Number(excludeId) : undefined);
            res.json({ exists });
        } catch (error) {
            next(error);
        }
    };
}
