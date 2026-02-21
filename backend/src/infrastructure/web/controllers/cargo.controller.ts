import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllCargosUseCase } from '../../../application/cargos/use-cases/get-all-cargos.use-case';
import { GetCargoByIdUseCase } from '../../../application/cargos/use-cases/get-cargo-by-id.use-case';
import { CreateCargoUseCase } from '../../../application/cargos/use-cases/create-cargo.use-case';
import { UpdateCargoUseCase } from '../../../application/cargos/use-cases/update-cargo.use-case';
import { DeleteCargoUseCase } from '../../../application/cargos/use-cases/delete-cargo.use-case';
import { z } from 'zod';

const createCargoSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200, 'El nombre es muy largo')
});

const updateCargoSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200, 'El nombre es muy largo')
});

@injectable()
export class CargoController {
    constructor(
        @inject(GetAllCargosUseCase) private readonly getAllUseCase: GetAllCargosUseCase,
        @inject(GetCargoByIdUseCase) private readonly getByIdUseCase: GetCargoByIdUseCase,
        @inject(CreateCargoUseCase) private readonly createUseCase: CreateCargoUseCase,
        @inject(UpdateCargoUseCase) private readonly updateUseCase: UpdateCargoUseCase,
        @inject(DeleteCargoUseCase) private readonly deleteUseCase: DeleteCargoUseCase
    ) { }

    getAll = async (_req: Request, res: Response) => {
        try {
            const cargos = await this.getAllUseCase.execute();
            res.json(cargos);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener cargos' });
        }
    };

    getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const cargo = await this.getByIdUseCase.execute(Number(id));
            if (!cargo) {
                res.status(404).json({ error: 'Cargo no encontrado' });
                return;
            }
            res.json(cargo);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener cargo' });
        }
    };

    create = async (req: Request, res: Response) => {
        try {
            const data = createCargoSchema.parse(req.body);
            const cargo = await this.createUseCase.execute(data.nombre);
            res.status(201).json(cargo);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.errors });
                return;
            }
            res.status(500).json({ error: 'Error al crear cargo' });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = updateCargoSchema.parse(req.body);
            const cargo = await this.updateUseCase.execute(Number(id), data.nombre);
            res.json(cargo);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.errors });
                return;
            }
            res.status(500).json({ error: 'Error al actualizar cargo' });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.deleteUseCase.execute(Number(id));
            res.json({ message: 'Cargo eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar cargo' });
        }
    };
}
