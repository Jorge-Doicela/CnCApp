import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllMancomunidadesUseCase } from '../../../application/mancomunidad/use-cases/get-all-mancomunidades.use-case';
import { CreateMancomunidadUseCase } from '../../../application/mancomunidad/use-cases/create-mancomunidad.use-case';
import { z } from 'zod';

const schema = z.object({
    nombre: z.string().min(3)
});

@injectable()
export class MancomunidadController {
    constructor(
        @inject(GetAllMancomunidadesUseCase) private getAllUseCase: GetAllMancomunidadesUseCase,
        @inject(CreateMancomunidadUseCase) private createUseCase: CreateMancomunidadUseCase
    ) { }

    getAll = async (_req: Request, res: Response) => {
        try {
            const list = await this.getAllUseCase.execute();
            res.json(list);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener mancomunidades' });
        }
    };

    create = async (req: Request, res: Response) => {
        try {
            const data = schema.parse(req.body);
            const item = await this.createUseCase.execute(data.nombre);
            res.status(201).json(item);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear mancomunidad' });
        }
    };
}
