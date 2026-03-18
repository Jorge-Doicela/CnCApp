import { Router } from 'express';
import { container } from 'tsyringe';
import { ReportesController } from '../controllers/reportes.controller';
import { authenticate, authorize, requireModule } from '../middleware/auth.middleware';
import { ADMIN_ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(ReportesController);

// Todas las rutas requieren autenticación y permiso de reportes
router.use(authenticate);
router.use(requireModule('Gestionar reportes'));

router.get('/dashboard', controller.getDashboard);
router.get('/export-pdf', controller.exportPDF);

export default router;
