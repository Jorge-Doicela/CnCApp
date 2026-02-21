import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllCompetenciasUseCase } from '../../../application/competencia/use-cases/get-all-competencias.use-case';
import { GetCompetenciaByIdUseCase } from '../../../application/competencia/use-cases/get-competencia-by-id.use-case';
import { CreateCompetenciaUseCase } from '../../../application/competencia/use-cases/create-competencia.use-case';
import { UpdateCompetenciaUseCase } from '../../../application/competencia/use-cases/update-competencia.use-case';
import { DeleteCompetenciaUseCase } from '../../../application/competencia/use-cases/delete-competencia.use-case';
import { createCompetenciaSchema, updateCompetenciaSchema } from '../../../domain/competencia/schemas/competencia.schema';
import { z } from 'zod';

@injectable()
export class CompetenciaController {
    constructor(
        @inject(GetAllCompetenciasUseCase) private getAllUseCase: GetAllCompetenciasUseCase,
        @inject(GetCompetenciaByIdUseCase) private getByIdUseCase: GetCompetenciaByIdUseCase,
        @inject(CreateCompetenciaUseCase) private createUseCase: CreateCompetenciaUseCase,
        @inject(UpdateCompetenciaUseCase) private updateUseCase: UpdateCompetenciaUseCase,
        @inject(DeleteCompetenciaUseCase) private deleteUseCase: DeleteCompetenciaUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const competencias = await this.getAllUseCase.execute();
            res.json(competencias);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params['id'] as string);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const competencia = await this.getByIdUseCase.execute(id);
            if (!competencia) {
                res.status(404).json({ error: 'Competencia no encontrada' });
                return;
            }
            res.json(competencia);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = createCompetenciaSchema.parse(req.body);
            const competencia = await this.createUseCase.execute(data);
            res.status(201).json(competencia);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.errors });
                return;
            }
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params['id'] as string);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const data = updateCompetenciaSchema.parse(req.body);
            const competencia = await this.updateUseCase.execute(id, data);
            res.json(competencia);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.errors });
                return;
            }
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params['id'] as string);
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
