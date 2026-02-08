import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { CreatePlantillaUseCase } from '../../../application/plantilla/use-cases/create-plantilla.use-case';
import { GetAllPlantillasUseCase } from '../../../application/plantilla/use-cases/get-all-plantillas.use-case';
import { GetPlantillaByIdUseCase } from '../../../application/plantilla/use-cases/get-plantilla-by-id.use-case';
import { UpdatePlantillaUseCase } from '../../../application/plantilla/use-cases/update-plantilla.use-case';
import { DeletePlantillaUseCase } from '../../../application/plantilla/use-cases/delete-plantilla.use-case';
import { ActivarPlantillaUseCase } from '../../../application/plantilla/use-cases/activar-plantilla.use-case';

export class PlantillaController {

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const useCase = container.resolve(CreatePlantillaUseCase);
            const plantilla = await useCase.execute(req.body);
            res.status(201).json(plantilla);
        } catch (error) {
            next(error);
        }
    }

    async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const useCase = container.resolve(GetAllPlantillasUseCase);
            const plantillas = await useCase.execute();
            res.json(plantillas);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const useCase = container.resolve(GetPlantillaByIdUseCase);
            const plantilla = await useCase.execute(id);

            if (!plantilla) {
                res.status(404).json({ message: 'Plantilla no encontrada' });
                return;
            }

            res.json(plantilla);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const useCase = container.resolve(UpdatePlantillaUseCase);
            const plantilla = await useCase.execute(id, req.body);
            res.json(plantilla);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const useCase = container.resolve(DeletePlantillaUseCase);
            await useCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async activar(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const useCase = container.resolve(ActivarPlantillaUseCase);
            const plantilla = await useCase.execute(id);
            res.json(plantilla);
        } catch (error) {
            next(error);
        }
    }
}
