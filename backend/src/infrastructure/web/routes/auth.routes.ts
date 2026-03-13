import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/setup-biometric', authenticate, authController.setupBiometric);
router.get('/profile', authenticate, authController.getProfile);
router.post('/reset-password-request', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

export default router;
