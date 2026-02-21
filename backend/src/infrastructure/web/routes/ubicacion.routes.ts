import { Router } from 'express';
import { container } from 'tsyringe';
import { UbicacionController } from '../controllers/ubicacion.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ADMIN_ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(UbicacionController);

// Rutas de Ubicación (Lectura pública, Escritura Admin)
router.get('/provincias', controller.getProvincias);
router.put('/provincias/:id', [authenticate, authorize(...ADMIN_ROLES)], controller.updateProvincia);
router.delete('/provincias/:id', [authenticate, authorize(...ADMIN_ROLES)], controller.deleteProvincia);

router.get('/cantones', controller.getCantones);
router.put('/cantones/:id', [authenticate, authorize(...ADMIN_ROLES)], controller.updateCanton);
router.delete('/cantones/:id', [authenticate, authorize(...ADMIN_ROLES)], controller.deleteCanton);

router.get('/parroquias', controller.getParroquias);
router.put('/parroquias/:id', [authenticate, authorize(...ADMIN_ROLES)], controller.updateParroquia);
router.delete('/parroquias/:id', [authenticate, authorize(...ADMIN_ROLES)], controller.deleteParroquia);

export default router;
