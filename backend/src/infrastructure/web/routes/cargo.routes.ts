import { authenticate, authorize } from '../middleware/auth.middleware';
import { ADMIN_ROLES } from '../../../domain/shared/constants/roles.constants';
import { cargoController } from '../../../config/simple-entities.config';
import { createSimpleEntityRouter } from './simple-entity.router';

const router = createSimpleEntityRouter(cargoController, {
    readMiddlewares: [authenticate, authorize(...ADMIN_ROLES)],
    writeMiddlewares: [authenticate, authorize(...ADMIN_ROLES)],
});

export default router;
