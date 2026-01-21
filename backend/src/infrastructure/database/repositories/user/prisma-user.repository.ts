import { injectable } from 'tsyringe';
import prisma from '../../../../config/database';
import { User } from '../../../../domain/user/entities/user.entity';
import { UserRepository } from '../../../../domain/user/repositories/user.repository';
import { UserMapper } from '../../../../domain/user/mappers/user.mapper';

@injectable()
export class PrismaUserRepository implements UserRepository {
    async create(user: Partial<User>): Promise<User> {
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
        return UserMapper.toDomain(createdUser);
    }

    async findByCi(ci: string): Promise<User | null> {
        const user = await prisma.usuario.findUnique({
            where: { ci },
            include: {
                rol: true,
                entidad: true
            }
        });
        return user ? UserMapper.toDomain(user) : null;
    }

    async findById(id: number): Promise<User | null> {
        const user = await prisma.usuario.findUnique({
            where: { id },
            include: {
                rol: true,
                entidad: true
            }
        });
        return user ? UserMapper.toDomain(user) : null;
    }

    async update(id: number, userData: Partial<User>): Promise<User> {
        const user = await prisma.usuario.update({
            where: { id },
            data: {
                nombre: userData.nombre,
                email: userData.email,
                telefono: userData.telefono,
                tipoParticipante: userData.tipoParticipante,
                rolId: userData.rolId,
                entidadId: userData.entidadId
            },
            include: {
                rol: true,
                entidad: true
            }
        });
        return UserMapper.toDomain(user);
    }

    async findAll(): Promise<User[]> {
        const users = await prisma.usuario.findMany({
            include: {
                rol: true,
                entidad: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return users.map(user => UserMapper.toDomain(user));
    }

    async delete(id: number): Promise<void> {
        await prisma.usuario.delete({
            where: { id }
        });
    }
}
