import { injectable } from 'tsyringe';
import prisma from '../../config/database';
import { Rol, RolRepository } from '../../domain/user/rol.repository';

@injectable()
export class PrismaRolRepository implements RolRepository {

    async findAll(): Promise<Rol[]> {
        // Prisma return match schema, mapping might be needed if property names differ
        // but here schema.prisma maps to 'id', 'nombre' which matches our interface
        const roles = await prisma.rol.findMany({
            orderBy: { nombre: 'asc' }
        });
        return roles.map(r => ({
            ...r,
            // Ensure modulos is treated correctly (it is Json in prisma)
            modulos: r.modulos
        }));
    }

    async findById(id: number): Promise<Rol | null> {
        const rol = await prisma.rol.findUnique({ where: { id } });
        return rol ? { ...rol, modulos: rol.modulos } : null;
    }

    async findByName(nombre: string): Promise<Rol | null> {
        const rol = await prisma.rol.findUnique({ where: { nombre } }); // nombre is @unique in schema
        return rol ? { ...rol, modulos: rol.modulos } : null;
    }

    async create(rol: Omit<Rol, 'id'>): Promise<Rol> {
        const newRol = await prisma.rol.create({
            data: {
                nombre: rol.nombre,
                descripcion: rol.descripcion,
                modulos: rol.modulos || []
            }
        });
        return { ...newRol, modulos: newRol.modulos };
    }

    async update(id: number, rol: Partial<Rol>): Promise<Rol> {
        const updatedRol = await prisma.rol.update({
            where: { id },
            data: {
                ...(rol.nombre && { nombre: rol.nombre }),
                ...(rol.descripcion !== undefined && { descripcion: rol.descripcion }),
                ...(rol.modulos !== undefined && { modulos: rol.modulos }),
            }
        });
        return { ...updatedRol, modulos: updatedRol.modulos };
    }

    async delete(id: number): Promise<void> {
        await prisma.rol.delete({ where: { id } });
    }
}
