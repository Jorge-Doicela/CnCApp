import { Router, RequestHandler } from 'express';
import { SimpleEntityController } from '../controllers/simple-entity.controller';
import { SimpleEntity } from '../../../domain/shared/repositories/simple-entity.repository';

export interface SimpleEntityRouteOptions {
    /** Middlewares para rutas de lectura (GET) */
    readMiddlewares?: RequestHandler[];
    /** Middlewares para rutas de escritura (POST, PUT, DELETE) */
    writeMiddlewares?: RequestHandler[];
    /** Si true, no registra las rutas de escritura (solo lectura) */
    readOnly?: boolean;
}

/**
 * Crea un Router Express estándar para una entidad simple.
 * Evita repetir la misma configuración de rutas en cargo.routes.ts,
 * grado-ocupacional.routes.ts, mancomunidad.routes.ts, etc.
 *
 * @example
 * // cargo.routes.ts
 * export default createSimpleEntityRouter(cargoController, {
 *     readMiddlewares: [authenticate, authorize(...ADMIN_ROLES)],
 *     writeMiddlewares: [authenticate, authorize(...ADMIN_ROLES)],
 * });
 */
export function createSimpleEntityRouter<T extends SimpleEntity>(
    controller: SimpleEntityController<T>,
    options: SimpleEntityRouteOptions = {}
): Router {
    const { readMiddlewares = [], writeMiddlewares = [], readOnly = false } = options;
    const router = Router();

    // Rutas de Lectura
    router.get('/', ...readMiddlewares, controller.getAll);
    router.get('/:id', ...readMiddlewares, controller.getById);

    // Rutas de Escritura
    if (!readOnly) {
        router.post('/', ...writeMiddlewares, controller.create);
        router.put('/:id', ...writeMiddlewares, controller.update);
        router.delete('/:id', ...writeMiddlewares, controller.delete);
    }

    return router;
}
