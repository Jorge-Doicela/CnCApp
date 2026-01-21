import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { GetAllUsersUseCase } from '../../../application/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.use-case';
import { GetUserProfileUseCase } from '../../../application/use-cases/get-user-profile.use-case';
import { z } from 'zod';

const updateUserSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    email: z.string().email('Email inválido').optional(),
    telefono: z.string().optional(),
    tipoParticipante: z.number().int().min(0).max(3).optional(),
    rolId: z.number().int().optional(),
    entidadId: z.number().int().optional()
});

@injectable()
export class UserController {
    constructor(
        private getAllUsersUseCase: GetAllUsersUseCase,
        private getUserByIdUseCase: GetUserProfileUseCase,
        private updateUserUseCase: UpdateUserUseCase,
        private deleteUserUseCase: DeleteUserUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.getAllUsersUseCase.execute();
            res.json(users);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const user = await this.getUserByIdUseCase.execute(id);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            const data = updateUserSchema.parse(req.body);
            const user = await this.updateUserUseCase.execute(id, data);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID inválido' });
                return;
            }
            await this.deleteUserUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
