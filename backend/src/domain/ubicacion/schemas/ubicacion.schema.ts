import { z } from 'zod';

export const createProvinciaSchema = z.object({
    nombre_provincia: z.string().min(3, "El nombre de la provincia debe tener al menos 3 caracteres"),
    codigo_provincia: z.string().min(2, "El código debe tener al menos 2 caracteres"),
    estado: z.boolean().optional().default(true)
});

export const updateProvinciaSchema = createProvinciaSchema.partial();

export const createCantonSchema = z.object({
    nombre_canton: z.string().min(3, "El nombre del cantón debe tener al menos 3 caracteres"),
    codigo_canton: z.string().min(2, "El código del cantón debe tener al menos 2 caracteres"),
    codigo_provincia: z.string().min(2, "El código de provincia es requerido"),
    estado: z.boolean().optional().default(true),
    notas: z.string().optional()
});

export const updateCantonSchema = createCantonSchema.partial();

export const createParroquiaSchema = z.object({
    nombre_parroquia: z.string().min(3, "El nombre de la parroquia debe tener al menos 3 caracteres"),
    codigo_parroquia: z.string().min(2, "El código de la parroquia debe tener al menos 2 caracteres"),
    codigo_canton: z.string().min(2, "El código del cantón es requerido"),
    estado: z.boolean().optional().default(true)
});

export const updateParroquiaSchema = createParroquiaSchema.partial();
