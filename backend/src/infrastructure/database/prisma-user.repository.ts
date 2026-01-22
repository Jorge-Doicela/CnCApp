

import prisma from '../../config/database'; // Using singleton instance
import { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';

export class PrismaUserRepository implements UserRepository {
    async findByCi(ci: string): Promise<User | null> {
        const user = await prisma.usuario.findUnique({
            where: { ci },
            include: { rol: true, entidad: true }
        });
        if (!user) return null;
        return this.mapToEntity(user);
    }

    async findById(id: number): Promise<User | null> {
        const user = await prisma.usuario.findUnique({
            where: { id },
            include: { rol: true, entidad: true }
        });
        if (!user) return null;
        return this.mapToEntity(user);
    }

    async save(user: User): Promise<User> {
        const created = await prisma.usuario.create({
            data: {
                ci: user.ci,
                nombre: user.nombre,
                email: user.email,
                telefono: user.telefono,
                password: user.password!,
                rolId: user.rolId,
                entidadId: user.entidadId,
                // assuming default participant type 0 if not specified.
                tipoParticipante: 0
            },
            include: { rol: true, entidad: true }
        });
        return this.mapToEntity(created);
    }

    async update(id: number, user: Partial<User>): Promise<User> {
        const updated = await prisma.usuario.update({
            where: { id },
            data: {
                ...(user.nombre && { nombre: user.nombre }),
                ...(user.email && { email: user.email }),
                ...(user.telefono && { telefono: user.telefono }),
                ...(user.password && { password: user.password })
            },
            include: { rol: true, entidad: true }
        });
        return this.mapToEntity(updated);
    }

    // Mapper helper
    private mapToEntity(prismaUser: any): User {
        return {
            id: prismaUser.id,
            ci: prismaUser.ci,
            nombre: prismaUser.nombre,
            email: prismaUser.email,
            telefono: prismaUser.telefono,
            password: prismaUser.password,
            rolId: prismaUser.rolId,
            rol: prismaUser.rol ? {
                id: prismaUser.rol.id,
                nombre: prismaUser.rol.nombre,
                modulos: prismaUser.rol.modulos
            } : undefined,
            entidadId: prismaUser.entidadId,
            entidad: prismaUser.entidad ? {
                id: prismaUser.entidad.id,
                nombre: prismaUser.entidad.nombre
            } : undefined
        };
    }
}
