import { Router } from 'express';
import { container } from 'tsyringe';
import { RolController } from '../controllers/rol.controller';
import { authenticate, authorize, requireModule } from '../middleware/auth.middleware';
import { ADMIN_ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const rolController = container.resolve(RolController);

router.use(authenticate);
router.use(requireModule('Gestionar roles'));

router.get('/', rolController.getAll);
router.get('/:id', rolController.getById);
router.post('/', rolController.create);
router.put('/:id', rolController.update);
router.delete('/:id', rolController.delete);

export default router;
