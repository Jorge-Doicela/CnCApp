import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllInstitucionesUseCase } from '../../../application/institucion/use-cases/get-all-instituciones.use-case';
import { GetInstitucionByIdUseCase } from '../../../application/institucion/use-cases/get-institucion-by-id.use-case';
import { CreateInstitucionUseCase } from '../../../application/institucion/use-cases/create-institucion.use-case';
import { UpdateInstitucionUseCase } from '../../../application/institucion/use-cases/update-institucion.use-case';
import { DeleteInstitucionUseCase } from '../../../application/institucion/use-cases/delete-institucion.use-case';

@injectable()
export class InstitucionController {
    constructor(
        @inject(GetAllInstitucionesUseCase) private getAllUseCase: GetAllInstitucionesUseCase,
        @inject(GetInstitucionByIdUseCase) private getByIdUseCase: GetInstitucionByIdUseCase,
        @inject(CreateInstitucionUseCase) private createUseCase: CreateInstitucionUseCase,
        @inject(UpdateInstitucionUseCase) private updateUseCase: UpdateInstitucionUseCase,
        @inject(DeleteInstitucionUseCase) private deleteUseCase: DeleteInstitucionUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const instituciones = await this.getAllUseCase.execute();
            res.json(instituciones);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params['id'] as string);
            const institucion = await this.getByIdUseCase.execute(id);
            if (!institucion) {
                res.status(404).json({ message: 'Institución no encontrada' });
                return;
            }
            res.json(institucion);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const institucion = await this.createUseCase.execute(req.body);
            res.status(201).json(institucion);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params['id'] as string);
            const institucion = await this.updateUseCase.execute(id, req.body);
            res.json(institucion);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params['id'] as string);
            await this.deleteUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
