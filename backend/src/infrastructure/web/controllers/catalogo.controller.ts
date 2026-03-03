import { Request, Response } from 'express';
import prisma from '../../../config/database';

export class CatalogoController {
    async getGeneros(_req: Request, res: Response): Promise<void> {
        try {
            const generos = await prisma.genero.findMany({
                orderBy: {
                    id: 'asc'
                }
            });
            res.json(generos);
        } catch (error) {
            console.error('Error fetching generos:', error);
            res.status(500).json({ error: 'Internal server error while fetching generos' });
        }
    }

    async getEtnias(_req: Request, res: Response): Promise<void> {
        try {
            const etnias = await prisma.etnia.findMany({
                orderBy: {
                    id: 'asc'
                }
            });
            res.json(etnias);
        } catch (error) {
            console.error('Error fetching etnias:', error);
            res.status(500).json({ error: 'Internal server error while fetching etnias' });
        }
    }

    async getTiposParticipante(_req: Request, res: Response): Promise<void> {
        try {
            const tipos = await prisma.tipoParticipante.findMany({
                orderBy: {
                    id: 'asc'
                }
            });
            res.json(tipos);
        } catch (error) {
            console.error('Error fetching tipos participante:', error);
            res.status(500).json({ error: 'Internal server error while fetching tipos participante' });
        }
    }

    async getNacionalidades(_req: Request, res: Response): Promise<void> {
        try {
            const nacionalidades = await prisma.nacionalidad.findMany({
                orderBy: { id: 'asc' }
            });
            res.json(nacionalidades);
        } catch (error) {
            console.error('Error fetching nacionalidades:', error);
            res.status(500).json({ error: 'Internal server error while fetching nacionalidades' });
        }
    }
}
