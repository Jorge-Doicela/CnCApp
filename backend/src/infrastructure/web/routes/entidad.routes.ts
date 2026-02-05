import { Router } from 'express';
import { container } from 'tsyringe';
import { EntidadController } from '../controllers/entidad.controller';

const router = Router();
const entidadController = container.resolve(EntidadController);

router.get('/', entidadController.getAll);

export default router;
