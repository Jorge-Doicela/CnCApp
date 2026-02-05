import { Router } from 'express';
import { container } from 'tsyringe';
import { UbicacionController } from '../controllers/ubicacion.controller';

const router = Router();
const controller = container.resolve(UbicacionController);

// Rutas de Ubicación
router.get('/provincias', controller.getProvincias);
router.get('/cantones', controller.getCantones);

export default router;
