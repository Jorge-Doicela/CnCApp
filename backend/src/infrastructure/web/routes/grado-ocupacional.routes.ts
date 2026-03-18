import { gradoOcupacionalController } from '../../../config/simple-entities.config';
import { createSimpleEntityRouter } from './simple-entity.router';
import { authenticate, requireModule } from '../middleware/auth.middleware';

// Grado Ocupacional es de consulta pública (sin auth requerida según la config original)
// Grado Ocupacional es de consulta pública, pero escritura requiere permisos
export const gradoOcupacionalRoutes = createSimpleEntityRouter(gradoOcupacionalController, {
    writeMiddlewares: [authenticate, requireModule('Gestionar grados ocupacionales')]
});
