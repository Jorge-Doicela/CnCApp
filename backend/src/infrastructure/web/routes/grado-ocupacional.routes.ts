import { gradoOcupacionalController } from '../../../config/simple-entities.config';
import { createSimpleEntityRouter } from './simple-entity.router';

// Grado Ocupacional es de consulta pública (sin auth requerida según la config original)
export const gradoOcupacionalRoutes = createSimpleEntityRouter(gradoOcupacionalController);
