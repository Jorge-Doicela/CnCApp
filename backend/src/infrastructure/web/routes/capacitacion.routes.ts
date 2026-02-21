import { Router } from 'express';
import { container } from 'tsyringe';
import { CapacitacionController } from '../controllers/capacitacion.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(CapacitacionController);

const STAFF_ROLES = [ROLES.ADMINISTRADOR, ROLES.CONFERENCISTA];

// Public routes (Lectura)
router.get('/count', controller.count);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Protected routes (Escritura - Solo Staff)
router.post('/', [authenticate, authorize(...STAFF_ROLES)], controller.create);
router.put('/:id', [authenticate, authorize(...STAFF_ROLES)], controller.update);
router.delete('/:id', [authenticate, authorize(...STAFF_ROLES)], controller.delete);

export default router;
