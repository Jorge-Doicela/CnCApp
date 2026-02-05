import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetProvinciasUseCase } from '../../../application/ubicacion/use-cases/get-provincias.use-case';
import { GetCantonesUseCase } from '../../../application/ubicacion/use-cases/get-cantones.use-case';

@injectable()
export class UbicacionController {
    constructor(
        @inject(GetProvinciasUseCase) private getProvinciasUseCase: GetProvinciasUseCase,
        @inject(GetCantonesUseCase) private getCantonesUseCase: GetCantonesUseCase
    ) { }

    getProvincias = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const provincias = await this.getProvinciasUseCase.execute();
            res.json(provincias);
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
}
