import { Router } from 'express';
import { container } from 'tsyringe';
import { PlantillaController } from '../controllers/plantilla.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(PlantillaController);
const STAFF_ROLES = [ROLES.ADMINISTRADOR, ROLES.CONFERENCISTA];

// Todas las rutas de plantillas requieren ser Admin o Conferencista
router.use(authenticate);
router.use(authorize(...STAFF_ROLES));

router.post('/', controller.create.bind(controller));
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
router.patch('/:id/activar', controller.activar.bind(controller));

export default router;
