import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllRolesUseCase } from '../../../application/user/use-cases/get-all-roles.use-case';

@injectable()
export class RolController {
    constructor(
        @inject(GetAllRolesUseCase) private getAllRolesUseCase: GetAllRolesUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const roles = await this.getAllRolesUseCase.execute();
            res.json(roles);
        } catch (error) {
            next(error);
        }
    };
}
