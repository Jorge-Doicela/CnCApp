import { Router } from 'express';
import { container } from 'tsyringe';
import { PlantillaController } from '../controllers/plantilla.controller';
import { authenticate, authorize, requireModule } from '../middleware/auth.middleware';
import { ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(PlantillaController);

// Rutas protegidas por el módulo correspondiente
router.use(authenticate);
router.use(requireModule('Gestionar plantillas'));

router.post('/', controller.create.bind(controller));
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
router.patch('/:id/activar', controller.activar.bind(controller));

export default router;
