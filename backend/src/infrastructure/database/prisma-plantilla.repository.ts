import prisma from '../../config/database';
import { Plantilla } from '../../domain/plantilla/plantilla.entity';
import { PlantillaRepository } from '../../domain/plantilla/plantilla.repository';
import { env } from '../../config/env';

export class PrismaPlantillaRepository implements PlantillaRepository {
    async create(plantilla: Partial<Plantilla>): Promise<Plantilla> {
        const { nombre, imagenUrl, base64Imagen, configuracion, activa } = plantilla;
        const p = await prisma.plantilla.create({
            data: {
                nombre: nombre!,
                imagenUrl: imagenUrl!,
                base64Imagen: base64Imagen || null,
                configuracion: configuracion || {},
                activa: activa || false
            }
        });
        return this.mapToEntity(p);
    }

    async findAll(): Promise<Plantilla[]> {
        const plantillas = await prisma.plantilla.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return plantillas.map(p => this.mapToEntity(p));
    }

    async findById(id: number): Promise<Plantilla | null> {
        const p = await prisma.plantilla.findUnique({
            where: { id }
        });
        return p ? this.mapToEntity(p) : null;
    }
    private mapToEntity(p: any): Plantilla {
        // 1. Resolver URL absoluta
        if (p.imagenUrl && !p.imagenUrl.startsWith('http') && !p.imagenUrl.startsWith('data:')) {
            const baseUrl = env.BASE_URL.endsWith('/') ? env.BASE_URL.slice(0, -1) : env.BASE_URL;
            const path = p.imagenUrl.startsWith('/') ? p.imagenUrl : `/${p.imagenUrl}`;
            p.imagenUrl = `${baseUrl}${path}`;
        }
        
        // Ensure base64Imagen is explicitly mapped (it might be in 'p' from Prisma)

        // 2. Normalizar configuración (fallback para datos viejos)
        if (p.configuracion && (p.configuracion.elements || !p.configuracion.nombreUsuario)) {
            p.configuracion = {
                nombreUsuario: { x: 420, y: 300, fontSize: 32, color: '#1a1a1a' },
                curso: { x: 420, y: 370, fontSize: 18, color: '#333333' },
                fecha: { x: 420, y: 450, fontSize: 14, color: '#666666' }
            };
        }

        return p;
    }

    async update(id: number, plantilla: Partial<Plantilla>): Promise<Plantilla> {
        const { nombre, imagenUrl, base64Imagen, configuracion, activa } = plantilla;
        const p = await prisma.plantilla.update({
            where: { id },
            data: {
                nombre,
                imagenUrl,
                base64Imagen,
                configuracion,
                activa
            }
        });
        return this.mapToEntity(p);
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
        const p = await prisma.plantilla.update({
            where: { id },
            data: { activa: true }
        });
        return this.mapToEntity(p);
    }
}
