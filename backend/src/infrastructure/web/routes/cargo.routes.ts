import { Router } from 'express';
import { container } from 'tsyringe';
import { CargoController } from '../controllers/cargo.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = container.resolve(CargoController);

// router.use(authenticate);
// router.use(authorize(1)); // Solo admin

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
