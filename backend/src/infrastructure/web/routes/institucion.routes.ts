import { Router } from 'express';
import { container } from 'tsyringe';
import { InstitucionController } from '../controllers/institucion.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = container.resolve(InstitucionController);

// Public or Protected? Usually these lists are public for registration but the request came from an admin page
// router.use(authenticate);

router.get('/', controller.getAll);

export default router;
