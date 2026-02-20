import { Router } from 'express';
import { container } from 'tsyringe';
import { CargoController } from '../controllers/cargo.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import { ADMIN_ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(CargoController);

// router.use(authenticate);
// Todas las rutas de cargos requieren autenticación y rol de administrador
router.get('/', authenticate, authorize(...ADMIN_ROLES), controller.getAll);
router.get('/:id', authenticate, authorize(...ADMIN_ROLES), controller.getById);
router.post('/', authenticate, authorize(...ADMIN_ROLES), controller.create);
router.put('/:id', authenticate, authorize(...ADMIN_ROLES), controller.update);
router.delete('/:id', authenticate, authorize(...ADMIN_ROLES), controller.delete);

export default router;
