import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllRolesUseCase } from '../../../application/user/use-cases/get-all-roles.use-case';
import { GetRolByIdUseCase } from '../../../application/user/use-cases/get-rol-by-id.use-case';
import { CreateRolUseCase } from '../../../application/user/use-cases/create-rol.use-case';
import { UpdateRolUseCase } from '../../../application/user/use-cases/update-rol.use-case';
import { DeleteRolUseCase } from '../../../application/user/use-cases/delete-rol.use-case';
import { parseIdParam } from '../middleware/parse-id.helper';
import { NotFoundError } from '../../../domain/shared/errors';
import { z } from 'zod';

const roleSchema = z.object({
    nombre: z.string().min(3, 'El nombre del rol debe tener al menos 3 caracteres'),
    descripcion: z.string().optional().nullable(),
    estado: z.boolean().optional(),
    modulos: z.union([z.array(z.string()), z.string()]).optional().nullable()
});

@injectable()
export class RolController {
    constructor(
        @inject(GetAllRolesUseCase) private getAllRolesUseCase: GetAllRolesUseCase,
        @inject(GetRolByIdUseCase) private getRolByIdUseCase: GetRolByIdUseCase,
        @inject(CreateRolUseCase) private createRolUseCase: CreateRolUseCase,
        @inject(UpdateRolUseCase) private updateRolUseCase: UpdateRolUseCase,
        @inject(DeleteRolUseCase) private deleteRolUseCase: DeleteRolUseCase
    ) { }

    getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roles = await this.getAllRolesUseCase.execute();
            res.json(roles);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const rol = await this.getRolByIdUseCase.execute(id);
            if (!rol) throw new NotFoundError('Rol no encontrado');
            res.json(rol);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleData = roleSchema.parse(req.body);
            const newRole = await this.createRolUseCase.execute(roleData);
            res.status(201).json(newRole);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const roleData = roleSchema.partial().parse(req.body);
            const updatedRole = await this.updateRolUseCase.execute(id, roleData);
            res.json(updatedRole);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            await this.deleteRolUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
