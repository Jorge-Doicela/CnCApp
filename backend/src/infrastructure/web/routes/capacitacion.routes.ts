import { Router } from 'express';
import { container } from 'tsyringe';
import { CapacitacionController } from '../controllers/capacitacion.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = container.resolve(CapacitacionController);

// Public routes
router.get('/count', controller.count);
router.get('/', controller.getAll);

// Protected routes
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

export default router;
