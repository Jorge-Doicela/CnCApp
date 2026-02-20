import { Router } from 'express';
import { container } from 'tsyringe';
import { ReportesController } from '../controllers/reportes.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import { ADMIN_ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(ReportesController);

// Todas las rutas requieren autenticación y rol de administrador
router.use(authenticate);
router.use(authorize(...ADMIN_ROLES));

router.get('/dashboard', controller.getDashboard);

export default router;
