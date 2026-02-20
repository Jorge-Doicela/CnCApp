import { Router } from 'express';
import { container } from 'tsyringe';
import { UbicacionController } from '../controllers/ubicacion.controller';

const router = Router();
const controller = container.resolve(UbicacionController);

// Rutas de Ubicación
router.get('/provincias', controller.getProvincias);
router.put('/provincias/:id', controller.updateProvincia);
router.delete('/provincias/:id', controller.deleteProvincia);

router.get('/cantones', controller.getCantones);
router.put('/cantones/:id', controller.updateCanton);
router.delete('/cantones/:id', controller.deleteCanton);

router.get('/parroquias', controller.getParroquias);
router.put('/parroquias/:id', controller.updateParroquia);
router.delete('/parroquias/:id', controller.deleteParroquia);

export default router;
