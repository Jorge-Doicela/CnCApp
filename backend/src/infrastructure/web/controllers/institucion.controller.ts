import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllInstitucionesUseCase } from '../../../application/institucion/use-cases/get-all-instituciones.use-case';

@injectable()
export class InstitucionController {
    constructor(
        @inject(GetAllInstitucionesUseCase) private getAllUseCase: GetAllInstitucionesUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const instituciones = await this.getAllUseCase.execute();
            res.json(instituciones);
        } catch (error) {
            next(error);
        }
    };
}
