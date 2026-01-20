import prisma from '../../../config/database';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';

export class PrismaUserRepository implements UserRepository {
    async create(user: Partial<User>): Promise<User> {
        // Prisma expects specific input types. We cast 'any' here for simplicity in this refactor,
        // but in a strict environment we should separate Domain User from Prisma User input.
        const createdUser = await prisma.usuario.create({
            data: {
                nombre: user.nombre!,
                ci: user.ci!,
                email: user.email,
                telefono: user.telefono,
                password: user.password!,
                tipoParticipante: user.tipoParticipante || 0,
                rolId: user.rolId || 2, // Default role
                entidadId: user.entidadId
            },
            include: {
                rol: true,
                entidad: true
            }
        });
        return createdUser as unknown as User;
    }

    async findByCi(ci: string): Promise<User | null> {
        const user = await prisma.usuario.findUnique({
            where: { ci },
            include: {
                rol: true,
                entidad: true
            }
        });
        return user as unknown as User;
    }

    async findById(id: number): Promise<User | null> {
        const user = await prisma.usuario.findUnique({
            where: { id },
            include: {
                rol: true,
                entidad: true
            }
        });
        return user as unknown as User;
    }

    async update(id: number, userData: Partial<User>): Promise<User> {
        const user = await prisma.usuario.update({
            where: { id },
            data: {
                nombre: userData.nombre,
                email: userData.email,
                telefono: userData.telefono,
                tipoParticipante: userData.tipoParticipante,
                // Add other fields as necessary
            },
            include: {
                rol: true,
                entidad: true
            }
        });
        return user as unknown as User;
    }
}
