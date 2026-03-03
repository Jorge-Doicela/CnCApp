import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllUsersUseCase } from '../../../application/user/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from '../../../application/user/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../../application/user/use-cases/delete-user.use-case';
import { GetUserProfileUseCase } from '../../../application/user/use-cases/get-user-profile.use-case';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/register-user.use-case';
import { z } from 'zod';

const updateUserSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    primerNombre: z.string().optional(),
    segundoNombre: z.string().optional(),
    primerApellido: z.string().optional(),
    segundoApellido: z.string().optional(),
    email: z.string().email('Email inválido').optional(),
    telefono: z.string().optional(),
    celular: z.string().optional(),
    tipoParticipanteId: z.number().int().optional(),
    rolId: z.number().int().optional(),
    entidadId: z.number().int().optional(),
    provinciaId: z.number().int().optional(),
    cantonId: z.number().int().optional(),
    fotoPerfilUrl: z.string().url('URL de foto inválida').optional().or(z.literal('')).or(z.null()),
    firmaUrl: z.string().url('URL de firma inválida').optional().or(z.literal('')).or(z.null()),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional()
});

const createUserSchema = z.object({
    primerNombre: z.string().min(2, 'El primer nombre es requerido'),
    segundoNombre: z.string().optional(),
    primerApellido: z.string().min(2, 'El primer apellido es requerido'),
    segundoApellido: z.string().optional(),
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos'),
    email: z.string().email('Email inválido'),
    telefono: z.string().optional(),
    celular: z.string().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    tipoParticipanteId: z.number().int().optional().nullable(),
    provinciaId: z.number().optional().nullable(),
    cantonId: z.number().optional().nullable(),
    generoId: z.number().optional(),
    etniaId: z.number().optional(),
    nacionalidadId: z.number().optional(),
    rolId: z.number().optional().nullable(),
    autoridad: z.any().optional(),
    funcionarioGad: z.any().optional(),
    institucion: z.any().optional()
});

@injectable()
export class UserController {
    constructor(
        @inject(GetAllUsersUseCase) private getAllUsersUseCase: GetAllUsersUseCase,
        @inject(GetUserProfileUseCase) private getUserByIdUseCase: GetUserProfileUseCase,
        @inject(RegisterUserUseCase) private registerUserUseCase: RegisterUserUseCase,
        @inject(UpdateUserUseCase) private updateUserUseCase: UpdateUserUseCase,
        @inject(DeleteUserUseCase) private deleteUserUseCase: DeleteUserUseCase
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

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = createUserSchema.parse(req.body);
            // Reutilzamos el registro para crear un usuario desde el admin panel
            const result = await this.registerUserUseCase.execute({
                ci: data.ci,
                primerNombre: data.primerNombre,
                segundoNombre: data.segundoNombre,
                primerApellido: data.primerApellido,
                segundoApellido: data.segundoApellido,
                email: data.email,
                password: data.password,
                telefono: data.telefono,
                celular: data.celular,
                tipoParticipanteId: data.tipoParticipanteId || undefined,
                provinciaId: data.provinciaId || undefined,
                cantonId: data.cantonId || undefined,
                generoId: data.generoId || undefined,
                etniaId: data.etniaId || undefined,
                nacionalidadId: data.nacionalidadId || undefined,
                rolId: data.rolId || undefined,
                autoridad: data.autoridad,
                funcionarioGad: data.funcionarioGad,
                institucion: data.institucion
            });

            const { password, ...userWithoutPassword } = result.user as any;
            res.status(201).json(userWithoutPassword);
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

    count = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.getAllUsersUseCase.execute();
            res.json({ count: users.length });
        } catch (error) {
            next(error);
        }
    };

    getByAuthId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authId = req.params.authId as string;
            if (!authId) {
                res.status(400).json({ error: 'Auth ID inválido' });
                return;
            }
            const user = await this.getUserByIdUseCase.execute(authId);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };
}
