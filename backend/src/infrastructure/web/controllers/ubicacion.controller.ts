import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetProvinciasUseCase } from '../../../application/ubicacion/use-cases/get-provincias.use-case';
import { GetCantonesUseCase } from '../../../application/ubicacion/use-cases/get-cantones.use-case';
import { GetParroquiasUseCase } from '../../../application/ubicacion/use-cases/get-parroquias.use-case';
import { UpdateProvinciaUseCase } from '../../../application/ubicacion/use-cases/update-provincia.use-case';
import { DeleteProvinciaUseCase } from '../../../application/ubicacion/use-cases/delete-provincia.use-case';
import { UpdateCantonUseCase } from '../../../application/ubicacion/use-cases/update-canton.use-case';
import { DeleteCantonUseCase } from '../../../application/ubicacion/use-cases/delete-canton.use-case';
import { UpdateParroquiaUseCase } from '../../../application/ubicacion/use-cases/update-parroquia.use-case';
import { DeleteParroquiaUseCase } from '../../../application/ubicacion/use-cases/delete-parroquia.use-case';

@injectable()
export class UbicacionController {
    constructor(
        @inject(GetProvinciasUseCase) private getProvinciasUseCase: GetProvinciasUseCase,
        @inject(GetCantonesUseCase) private getCantonesUseCase: GetCantonesUseCase,
        @inject(GetParroquiasUseCase) private getParroquiasUseCase: GetParroquiasUseCase,
        @inject(UpdateProvinciaUseCase) private updateProvinciaUseCase: UpdateProvinciaUseCase,
        @inject(DeleteProvinciaUseCase) private deleteProvinciaUseCase: DeleteProvinciaUseCase,
        @inject(UpdateCantonUseCase) private updateCantonUseCase: UpdateCantonUseCase,
        @inject(DeleteCantonUseCase) private deleteCantonUseCase: DeleteCantonUseCase,
        @inject(UpdateParroquiaUseCase) private updateParroquiaUseCase: UpdateParroquiaUseCase,
        @inject(DeleteParroquiaUseCase) private deleteParroquiaUseCase: DeleteParroquiaUseCase
    ) { }

    getProvincias = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const provincias = await this.getProvinciasUseCase.execute();
            res.json(provincias);
        } catch (error) {
            next(error);
        }
    };

    updateProvincia = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const updated = await this.updateProvinciaUseCase.execute(id, data);
            res.json(updated);
        } catch (error) {
            next(error);
        }
    };

    deleteProvincia = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            await this.deleteProvinciaUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    getCantones = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const cantones = await this.getCantonesUseCase.execute();
            res.json(cantones);
        } catch (error) {
            next(error);
        }
    };

    updateCanton = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const updated = await this.updateCantonUseCase.execute(id, data);
            res.json(updated);
        } catch (error) {
            next(error);
        }
    };

    deleteCanton = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            await this.deleteCantonUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    getParroquias = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const parroquias = await this.getParroquiasUseCase.execute();
            res.json(parroquias);
        } catch (error) {
            next(error);
        }
    };

    updateParroquia = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const updated = await this.updateParroquiaUseCase.execute(id, data);
            res.json(updated);
        } catch (error) {
            next(error);
        }
    };

    deleteParroquia = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            await this.deleteParroquiaUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
