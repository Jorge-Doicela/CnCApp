import { Router } from 'express';
import { container } from 'tsyringe';
import { InstitucionController } from '../controllers/institucion.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ADMIN_ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(InstitucionController);

router.use(authenticate);

// Publicly readable for authenticated users (required for profile/registration)
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Management routes (Admins only)
router.use(authorize(...ADMIN_ROLES));
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
