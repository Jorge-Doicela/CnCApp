import { Router } from 'express';
import { PlantillaController } from '../controllers/plantilla.controller';

const router = Router();
const controller = new PlantillaController();

router.post('/', controller.create.bind(controller));
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
router.patch('/:id/activar', controller.activar.bind(controller));

// Upload legacy route (optional, frontend sends base64 now)
// router.post('/upload', upload.single('image'), controller.upload);

export default router;
