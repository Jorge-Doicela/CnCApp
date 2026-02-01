import { Router } from 'express';
import { container } from 'tsyringe';
import { ReportesController } from '../controllers/reportes.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';

const router = Router();
const controller = container.resolve(ReportesController);

// Todas las rutas requieren autenticación y rol de administrador (ID 1)
router.use(authenticate);
router.use(authorize(1)); // Solo administradores

router.get('/dashboard', controller.getDashboard);

export default router;
