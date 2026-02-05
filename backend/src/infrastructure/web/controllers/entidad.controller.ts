import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllEntidadesUseCase } from '../../../application/user/use-cases/get-all-entidades.use-case';

@injectable()
export class EntidadController {
    constructor(
        @inject(GetAllEntidadesUseCase) private getAllEntidadesUseCase: GetAllEntidadesUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const entidades = await this.getAllEntidadesUseCase.execute();
            res.json(entidades);
        } catch (error) {
            next(error);
        }
    };
}
