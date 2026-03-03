import { Router } from 'express';
import { container } from 'tsyringe';
import { GradoOcupacionalController } from '../controllers/grado-ocupacional.controller';

const router = Router();
const controller = container.resolve(GradoOcupacionalController);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as gradoOcupacionalRoutes };
