import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllGradosUseCase } from '../../../application/grado-ocupacional/use-cases/get-all-grados.use-case';
import { GetGradoByIdUseCase } from '../../../application/grado-ocupacional/use-cases/get-grado-by-id.use-case';
import { CreateGradoUseCase } from '../../../application/grado-ocupacional/use-cases/create-grado.use-case';
import { UpdateGradoUseCase } from '../../../application/grado-ocupacional/use-cases/update-grado.use-case';
import { DeleteGradoUseCase } from '../../../application/grado-ocupacional/use-cases/delete-grado.use-case';
import { z } from 'zod';

const createGradoSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200, 'El nombre es muy largo')
});

const updateGradoSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200, 'El nombre es muy largo')
});

@injectable()
export class GradoOcupacionalController {
    constructor(
        @inject(GetAllGradosUseCase) private readonly getAllUseCase: GetAllGradosUseCase,
        @inject(GetGradoByIdUseCase) private readonly getByIdUseCase: GetGradoByIdUseCase,
        @inject(CreateGradoUseCase) private readonly createUseCase: CreateGradoUseCase,
        @inject(UpdateGradoUseCase) private readonly updateUseCase: UpdateGradoUseCase,
        @inject(DeleteGradoUseCase) private readonly deleteUseCase: DeleteGradoUseCase
    ) { }

    getAll = async (_req: Request, res: Response) => {
        try {
            const grados = await this.getAllUseCase.execute();
            res.json(grados);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener grados ocupacionales' });
        }
    };

    getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const grado = await this.getByIdUseCase.execute(Number(id));
            if (!grado) {
                res.status(404).json({ error: 'Grado ocupacional no encontrado' });
                return;
            }
            res.json(grado);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener grado ocupacional' });
        }
    };

    create = async (req: Request, res: Response) => {
        try {
            const data = createGradoSchema.parse(req.body);
            const grado = await this.createUseCase.execute(data.nombre);
            res.status(201).json(grado);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.errors });
                return;
            }
            res.status(500).json({ error: 'Error al crear grado ocupacional' });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = updateGradoSchema.parse(req.body);
            const grado = await this.updateUseCase.execute(Number(id), data.nombre);
            res.json(grado);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.errors });
                return;
            }
            res.status(500).json({ error: 'Error al actualizar grado ocupacional' });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.deleteUseCase.execute(Number(id));
            res.json({ message: 'Grado ocupacional eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar grado ocupacional' });
        }
    };
}
