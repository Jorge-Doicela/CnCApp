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

    async getCargos(_req: Request, res: Response): Promise<void> {
        try {
            const cargos = await prisma.cargo.findMany({ orderBy: { id: 'asc' } });
            res.json(cargos);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error fetching cargos' });
        }
    }

    async getEntidades(_req: Request, res: Response): Promise<void> {
        try {
            const entidades = await prisma.entidad.findMany({ orderBy: { id: 'asc' } });
            res.json(entidades);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error fetching entidades' });
        }
    }

    async getInstituciones(_req: Request, res: Response): Promise<void> {
        try {
            const instituciones = await prisma.institucionSistema.findMany({ orderBy: { nombre: 'asc' } });
            res.json(instituciones);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error fetching instituciones' });
        }
    }

    async getMancomunidades(_req: Request, res: Response): Promise<void> {
        try {
            const mancomunidades = await prisma.mancomunidad.findMany({ orderBy: { nombre: 'asc' } });
            res.json(mancomunidades);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error fetching mancomunidades' });
        }
    }

    async getCompetencias(_req: Request, res: Response): Promise<void> {
        try {
            const competencias = await prisma.competencia.findMany({
                where: { estado_competencia: true },
                orderBy: { nombre_competencias: 'asc' }
            });
            const mapped = competencias.map((c: any) => ({
                id: c.id,
                nombre: c.nombre_competencias
            }));
            res.json(mapped);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error fetching competencias' });
        }
    }

    async getGradosOcupacionales(_req: Request, res: Response): Promise<void> {
        try {
            const grados = await prisma.gradoOcupacional.findMany({ orderBy: { nombre: 'asc' } });
            res.json(grados);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error fetching grados ocupacionales' });
        }
    }
}
