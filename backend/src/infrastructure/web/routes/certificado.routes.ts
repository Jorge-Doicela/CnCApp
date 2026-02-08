import { Router } from 'express';
import { container } from 'tsyringe';
import { CertificadoController } from '../controllers/certificado.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = container.resolve(CertificadoController);

// Public routes
router.get('/count', controller.count);
router.get('/qr/:qr', controller.getByQR);

router.get('/my', authenticate, controller.getMyCertificados);
router.post('/generate', authenticate, controller.generate);
router.post('/', authenticate, controller.create); // Should ideally restrict to admin

export default router;
