import { Router } from 'express';
import { container } from 'tsyringe';
import { EntidadController } from '../controllers/entidad.controller';

const router = Router();
const entidadController = container.resolve(EntidadController);

router.get('/', entidadController.getAll);
router.get('/:id', entidadController.getById);
router.post('/', entidadController.create);
router.put('/:id', entidadController.update);
router.delete('/:id', entidadController.delete);

export default router;
