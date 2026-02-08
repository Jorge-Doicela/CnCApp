
import prisma from '../../../config/database';
import { Plantilla } from '../../../domain/plantilla/plantilla.entity';
import { PlantillaRepository } from '../../../domain/plantilla/plantilla.repository';

export class PrismaPlantillaRepository implements PlantillaRepository {
    async create(plantilla: Partial<Plantilla>): Promise<Plantilla> {
        const { nombre, imagenUrl, configuracion, activa } = plantilla;
        return await prisma.plantilla.create({
            data: {
                nombre: nombre!,
                imagenUrl: imagenUrl!,
                configuracion: configuracion || {},
                activa: activa || false
            }
        });
    }

    async findAll(): Promise<Plantilla[]> {
        return await prisma.plantilla.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async findById(id: number): Promise<Plantilla | null> {
        return await prisma.plantilla.findUnique({
            where: { id }
        });
    }

    async update(id: number, plantilla: Partial<Plantilla>): Promise<Plantilla> {
        const { nombre, imagenUrl, configuracion, activa } = plantilla;
        return await prisma.plantilla.update({
            where: { id },
            data: {
                nombre,
                imagenUrl,
                configuracion,
                activa
            }
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.plantilla.delete({
            where: { id }
        });
    }

    async desactivarTodas(): Promise<void> {
        await prisma.plantilla.updateMany({
            where: { activa: true },
            data: { activa: false }
        });
    }

    async activar(id: number): Promise<Plantilla> {
        return await prisma.plantilla.update({
            where: { id },
            data: { activa: true }
        });
    }
}
