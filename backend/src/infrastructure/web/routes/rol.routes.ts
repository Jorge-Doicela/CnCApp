import { Router } from 'express';
import { container } from 'tsyringe';
import { RolController } from '../controllers/rol.controller';

const router = Router();
const rolController = container.resolve(RolController);

router.get('/', rolController.getAll);

export default router;
