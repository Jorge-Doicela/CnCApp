import { Router } from 'express';
import { container } from 'tsyringe';
import { CapacitacionController } from '../controllers/capacitacion.controller';
import { authenticate, authorize, requireModule } from '../middleware/auth.middleware';
import { ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(CapacitacionController);

const STAFF_ROLES = [ROLES.ADMINISTRADOR, ROLES.CONFERENCISTA];

// --- Rutas de Lectura (Públicas o Propias) ---
router.get('/validar-nombre', authenticate, controller.checkNombre);
router.get('/count', controller.count);
router.get('/', [authenticate], controller.getAll);
router.get('/:id', controller.getById);

// Protected routes (Escritura - Solo Staff con permiso de gestión)
router.post('/', [authenticate, requireModule('Gestionar capacitaciones')], controller.create);
router.put('/:id', [authenticate, requireModule('Gestionar capacitaciones')], controller.update);
router.delete('/:id', [authenticate, requireModule('Gestionar capacitaciones')], controller.delete);

export default router;
