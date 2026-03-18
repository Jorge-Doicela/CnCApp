import { Router } from 'express';
import { container } from 'tsyringe';
import { EntidadController } from '../controllers/entidad.controller';
import { authenticate, authorize, requireModule } from '../middleware/auth.middleware';
import { ADMIN_ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const entidadController = container.resolve(EntidadController);

router.use(authenticate);
router.use(requireModule('Gestionar entidades'));

router.get('/', entidadController.getAll);
router.get('/:id', entidadController.getById);
router.post('/', entidadController.create);
router.put('/:id', entidadController.update);
router.delete('/:id', entidadController.delete);

export default router;
