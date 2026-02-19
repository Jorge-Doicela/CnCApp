import { injectable } from 'tsyringe';
import { Rol, RolRepository } from '../../domain/user/rol.repository';
import { PrismaClient } from '@prisma/client';
import { container } from 'tsyringe';

@injectable()
export class PrismaRolRepository implements RolRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = container.resolve(PrismaClient);
    }

    async findAll(): Promise<Rol[]> {
        // Prisma return match schema, mapping might be needed if property names differ
        // but here schema.prisma maps to 'id', 'nombre' which matches our interface
        const roles = await this.prisma.rol.findMany({
            orderBy: { nombre: 'asc' }
        });
        return roles.map(r => ({
            ...r,
            // Ensure modulos is treated correctly (it is Json in prisma)
            modulos: r.modulos
        }));
    }

    async findById(id: number): Promise<Rol | null> {
        const rol = await this.prisma.rol.findUnique({ where: { id } });
        return rol ? { ...rol, modulos: rol.modulos } : null;
    }

    async create(rol: Omit<Rol, 'id'>): Promise<Rol> {
        const newRol = await this.prisma.rol.create({
            data: {
                nombre: rol.nombre,
                descripcion: rol.descripcion,
                modulos: rol.modulos || [],
                // backend schema doesn't seem to have 'estado' for Rol based on previous view?
                // Let's double check schema.prisma
            }
        });
        return { ...newRol, modulos: newRol.modulos };
    }

    async update(id: number, rol: Partial<Rol>): Promise<Rol> {
        const updatedRol = await this.prisma.rol.update({
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
        await this.prisma.rol.delete({ where: { id } });
    }
}
