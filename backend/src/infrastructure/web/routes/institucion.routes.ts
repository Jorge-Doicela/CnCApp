import { Router } from 'express';
import { container } from 'tsyringe';
import { InstitucionController } from '../controllers/institucion.controller';

const router = Router();
const controller = container.resolve(InstitucionController);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
