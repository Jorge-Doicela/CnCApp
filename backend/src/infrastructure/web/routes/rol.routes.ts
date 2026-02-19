import { Router } from 'express';
import { container } from 'tsyringe';
import { RolController } from '../controllers/rol.controller';

const router = Router();
const rolController = container.resolve(RolController);

router.get('/', rolController.getAll);
router.get('/:id', rolController.getById);
router.post('/', rolController.create);
router.put('/:id', rolController.update);
router.delete('/:id', rolController.delete);

export default router;
