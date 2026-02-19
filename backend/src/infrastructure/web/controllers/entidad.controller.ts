import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllEntidadesUseCase } from '../../../application/user/use-cases/get-all-entidades.use-case';
import { GetEntidadByIdUseCase } from '../../../application/user/use-cases/get-entidad-by-id.use-case';
import { CreateEntidadUseCase } from '../../../application/user/use-cases/create-entidad.use-case';
import { UpdateEntidadUseCase } from '../../../application/user/use-cases/update-entidad.use-case';
import { DeleteEntidadUseCase } from '../../../application/user/use-cases/delete-entidad.use-case';

@injectable()
export class EntidadController {
    constructor(
        @inject(GetAllEntidadesUseCase) private getAllEntidadesUseCase: GetAllEntidadesUseCase,
        @inject(GetEntidadByIdUseCase) private getEntidadByIdUseCase: GetEntidadByIdUseCase,
        @inject(CreateEntidadUseCase) private createEntidadUseCase: CreateEntidadUseCase,
        @inject(UpdateEntidadUseCase) private updateEntidadUseCase: UpdateEntidadUseCase,
        @inject(DeleteEntidadUseCase) private deleteEntidadUseCase: DeleteEntidadUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const entidades = await this.getAllEntidadesUseCase.execute();
            res.json(entidades);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id as string);
            const entidad = await this.getEntidadByIdUseCase.execute(id);
            if (!entidad) {
                res.status(404).json({ message: 'Entidad no encontrada' });
                return;
            }
            res.json(entidad);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { nombre } = req.body;
            // Validate required fields
            if (!nombre) {
                res.status(400).json({ message: 'El nombre es requerido' });
                return;
            }
            const entidad = await this.createEntidadUseCase.execute({ nombre });
            res.status(201).json(entidad);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id as string);
            const { nombre, estado } = req.body;
            // Note: 'estado' is mocked in repository, so we only pass what schema supports primarily
            const entidad = await this.updateEntidadUseCase.execute(id, { nombre, estado });
            res.json(entidad);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            await this.deleteEntidadUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
