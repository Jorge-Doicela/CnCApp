import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetAllUsersUseCase } from '../../../application/user/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from '../../../application/user/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../../application/user/use-cases/delete-user.use-case';
import { GetUserProfileUseCase } from '../../../application/user/use-cases/get-user-profile.use-case';
import { RegisterUserUseCase } from '../../../application/auth/use-cases/register-user.use-case';
import { parseIdParam } from '../middleware/parse-id.helper';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import prisma from '../../../config/database';

const autoridadSchema = z.object({
    cargo: z.string().optional().nullable(),
    gadAutoridad: z.string().optional().nullable(),
    nivelgobierno: z.number().int().optional().nullable()
});

const funcionarioGadSchema = z.object({
    cargo: z.string().optional().nullable(),
    gadFuncionarioGad: z.string().optional().nullable(),
    nivelgobierno: z.number().int().optional().nullable(),
    competencias: z.array(z.union([z.number(), z.string()])).optional().nullable()
});

const institucionSchema = z.object({
    institucion: z.union([z.number(), z.string()]),
    gradoOcupacional: z.union([z.number(), z.string()]).optional().nullable()
});

const updateUserSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional().nullable(),
    primerNombre: z.string().optional().nullable(),
    segundoNombre: z.string().optional().nullable(),
    primerApellido: z.string().optional().nullable(),
    segundoApellido: z.string().optional().nullable(),
    email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
    telefono: z.string().optional().nullable(),
    celular: z.string().optional().nullable(),
    tipoParticipanteId: z.number().int().optional().nullable(),
    rolId: z.number().int().optional().nullable(),
    entidadId: z.number().int().optional().nullable(),
    provinciaId: z.number().int().optional().nullable(),
    cantonId: z.number().int().optional().nullable(),
    generoId: z.number().int().optional().nullable(),
    etniaId: z.number().int().optional().nullable(),
    nacionalidadId: z.number().int().optional().nullable(),
    fechaNacimiento: z.string().optional().nullable(),
    fotoPerfilUrl: z.string().optional().or(z.literal('')).or(z.null()),
    firmaUrl: z.string().optional().or(z.literal('')).or(z.null()),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().nullable(),
    estado: z.number().int().optional().nullable(),
    autoridad: autoridadSchema.optional().nullable(),
    funcionarioGad: funcionarioGadSchema.optional().nullable(),
    institucion: institucionSchema.optional().nullable()
});

const createUserSchema = z.object({
    primerNombre: z.string().min(2, 'El primer nombre es requerido'),
    segundoNombre: z.string().optional().nullable(),
    primerApellido: z.string().min(2, 'El primer apellido es requerido'),
    segundoApellido: z.string().optional().nullable(),
    ci: z.string().length(10, 'La cédula debe tener 10 dígitos'),
    email: z.string().email('Email inválido'),
    telefono: z.string().optional().nullable(),
    celular: z.string().optional().nullable(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    tipoParticipanteId: z.number().int().optional().nullable(),
    provinciaId: z.number().optional().nullable(),
    cantonId: z.number().optional().nullable(),
    generoId: z.number().optional(),
    etniaId: z.number().optional(),
    nacionalidadId: z.number().optional(),
    rolId: z.number().optional().nullable(),
    autoridad: autoridadSchema.optional().nullable(),
    funcionarioGad: funcionarioGadSchema.optional().nullable(),
    institucion: institucionSchema.optional().nullable()
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

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
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
                segundoNombre: data.segundoNombre || undefined,
                primerApellido: data.primerApellido,
                segundoApellido: data.segundoApellido || undefined,
                email: data.email,
                password: data.password,
                telefono: data.telefono || undefined,
                celular: data.celular || undefined,
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

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            const data = updateUserSchema.parse(req.body);
            const user = await this.updateUserUseCase.execute(id, data as any);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseIdParam(req, res);
            if (id === null) return;
            await this.deleteUserUseCase.execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    count = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await prisma.usuario.count();
            res.json({ count });
        } catch (error) {
            next(error);
        }
    };

    getByAuthId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authIdStr = req.params.authId as string;
            if (!authIdStr) {
                res.status(400).json({ message: 'Auth ID inválido' });
                return;
            }

            // Try to parse as number first, since legacy code passes internal user ID here
            const numericId = parseInt(authIdStr, 10);
            const authId = !isNaN(numericId) && numericId.toString() === authIdStr
                ? numericId
                : authIdStr;

            const user = await this.getUserByIdUseCase.execute(authId);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/users/me
     * Devuelve el perfil completo del usuario autenticado (sin requerir ser admin).
     * Incluye inscripciones, certificados y datos de ubicación anidados.
     */
    getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.userId) {
                res.status(401).json({ message: 'Usuario no autenticado' });
                return;
            }
            const user = await this.getUserByIdUseCase.execute(req.userId);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/users/me
     * Permite al usuario actualizar sus propios datos (nombre, teléfono, ubicación, etc.).
     * No permite cambiar rol, entidad, ni ci.
     */
    updateMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.userId) {
                res.status(401).json({ message: 'Usuario no autenticado' });
                return;
            }
            // Schema más restrictivo que el de admin (no puede cambiar rol ni ci)
            const meSchema = z.object({
                primerNombre: z.string().min(2).optional(),
                segundoNombre: z.string().optional(),
                primerApellido: z.string().min(2).optional(),
                segundoApellido: z.string().optional(),
                email: z.string().email().optional(),
                telefono: z.string().optional(),
                celular: z.string().optional(),
                provinciaId: z.number().int().optional().nullable(),
                cantonId: z.number().int().optional().nullable(),
                fotoPerfilUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
                firmaUrl: z.string().optional().or(z.literal('')).or(z.null()),
                password: z.string().min(6).optional()
            });
            const data = meSchema.parse(req.body);
            const user = await this.updateUserUseCase.execute(req.userId, data);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };
}
