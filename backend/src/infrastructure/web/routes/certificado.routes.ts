import { Router } from 'express';
import { container } from 'tsyringe';
import { CertificadoController } from '../controllers/certificado.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(CertificadoController);

const STAFF_ROLES = [ROLES.ADMINISTRADOR, ROLES.CONFERENCISTA];

// Public routes (Verificación pública)
router.get('/count', controller.count);
router.get('/qr/:qr', controller.getByQR);

// User routes (Mis certificados)
router.get('/my', authenticate, controller.getMyCertificados);

// Management routes (Solo Staff)
router.post('/generate', [authenticate, authorize(...STAFF_ROLES)], controller.generate);
router.post('/', [authenticate, authorize(...STAFF_ROLES)], controller.create);

export default router;
