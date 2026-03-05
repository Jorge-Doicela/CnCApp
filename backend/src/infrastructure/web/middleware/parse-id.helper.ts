import { Request, Response } from 'express';

/**
 * Parsea y valida el parámetro :id de la ruta.
 * Responde automáticamente con 400 si el ID es inválido.
 * 
 * @returns el número si es válido, o null si ya respondió con error
 * 
 * @example
 * const id = parseIdParam(req, res);
 * if (id === null) return;
 * // ... usar id con seguridad
 */
export function parseIdParam(req: Request, res: Response, paramName = 'id'): number | null {
    const raw = req.params[paramName];
    const id = parseInt(raw as string, 10);
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ message: `Parámetro '${paramName}' debe ser un número entero positivo` });
        return null;
    }
    return id;
}
