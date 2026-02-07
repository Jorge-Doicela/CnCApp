import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';

export class PlantillaController {

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { nombre, imagenUrl, configuracion, activa } = req.body;

            // Si se activa esta, desactivar las demas
            if (activa) {
                await prisma.plantilla.updateMany({
                    where: { activa: true },
                    data: { activa: false }
                });
            }

            const plantilla = await prisma.plantilla.create({
                data: {
                    nombre,
                    imagenUrl,
                    configuracion: configuracion || {},
                    activa: activa || false
                }
            });

            res.status(201).json(plantilla);
        } catch (error) {
            next(error);
        }
    }

    async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const plantillas = await prisma.plantilla.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json(plantillas);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const plantilla = await prisma.plantilla.findUnique({
                where: { id }
            });

            if (!plantilla) {
                res.status(404).json({ message: 'Plantilla no encontrada' });
                return;
            }

            res.json(plantilla);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const { nombre, imagenUrl, configuracion, activa } = req.body;

            // Si se activa esta, desactivar las demas
            if (activa) {
                await prisma.plantilla.updateMany({
                    where: {
                        activa: true,
                        id: { not: id }
                    },
                    data: { activa: false }
                });
            }

            const plantilla = await prisma.plantilla.update({
                where: { id },
                data: {
                    nombre,
                    imagenUrl,
                    configuracion,
                    activa
                }
            });

            res.json(plantilla);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            // Verificar si es la activa
            const plantilla = await prisma.plantilla.findUnique({ where: { id } });
            if (plantilla?.activa) {
                res.status(400).json({ message: 'No se puede eliminar la plantilla activa' });
                return;
            }

            await prisma.plantilla.delete({
                where: { id }
            });

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async activar(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            // Desactivar todas
            await prisma.plantilla.updateMany({
                where: { activa: true },
                data: { activa: false }
            });

            // Activar la seleccionada
            const plantilla = await prisma.plantilla.update({
                where: { id },
                data: { activa: true }
            });

            res.json(plantilla);
        } catch (error) {
            next(error);
        }
    }
}
