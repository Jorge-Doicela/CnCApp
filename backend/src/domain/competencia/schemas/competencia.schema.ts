import { z } from 'zod';

export const createCompetenciaSchema = z.object({
    nombre_competencias: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200, 'El nombre es muy largo'),
    descripcion: z.string().optional().nullable(),
    estado_competencia: z.boolean().optional().default(true)
});

export const updateCompetenciaSchema = z.object({
    nombre_competencias: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200, 'El nombre es muy largo').optional(),
    descripcion: z.string().optional().nullable(),
    estado_competencia: z.boolean().optional()
});
