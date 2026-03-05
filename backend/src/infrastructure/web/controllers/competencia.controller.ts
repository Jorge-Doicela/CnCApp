import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllCompetenciasUseCase } from '../../../application/competencia/use-cases/get-all-competencias.use-case';
import { GetCompetenciaByIdUseCase } from '../../../application/competencia/use-cases/get-competencia-by-id.use-case';
import { CreateCompetenciaUseCase } from '../../../application/competencia/use-cases/create-competencia.use-case';
import { UpdateCompetenciaUseCase } from '../../../application/competencia/use-cases/update-competencia.use-case';
import { DeleteCompetenciaUseCase } from '../../../application/competencia/use-cases/delete-competencia.use-case';
import { createCompetenciaSchema, updateCompetenciaSchema } from '../../../domain/competencia/schemas/competencia.schema';
import { parseIdParam } from '../middleware/parse-id.helper';
import { NotFoundError } from '../../../domain/shared/errors';

@injectable()
export class CompetenciaController {
    constructor(
        @inject(GetAllCompetenciasUseCase) private getAllUseCase: GetAllCompetenciasUseCase,
        @inject(GetCompetenciaByIdUseCase) private getByIdUseCase: GetCompetenciaByIdUseCase,
        @inject(CreateCompetenciaUseCase) private createUseCase: CreateCompetenciaUseCase,
        @inject(UpdateCompetenciaUseCase) private updateUseCase: UpdateCompetenciaUseCase,
        @inject(DeleteCompetenciaUseCase) private deleteUseCase: DeleteCompetenciaUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const competencias = await this.getAllUseCase.execute();
            res.json(competencias);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const competencia = await this.getByIdUseCase.execute(id);
            if (!competencia) throw new NotFoundError('Competencia no encontrada');
            res.json(competencia);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // ZodError se propaga a next(error) → errorHandler global lo maneja con 400
            const data = createCompetenciaSchema.parse(req.body);
            const competencia = await this.createUseCase.execute(data);
            res.status(201).json(competencia);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const data = updateCompetenciaSchema.parse(req.body);
            const competencia = await this.updateUseCase.execute(id, data);
            res.json(competencia);
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
