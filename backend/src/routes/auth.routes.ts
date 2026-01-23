import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';


/**
 * Authentication Routes
 */
const router = Router();

// POST /api/auth/register
router.post('/register', AuthController.register);

// POST /api/auth/login
router.post('/login', AuthController.login);

// POST /api/auth/refresh
router.post('/refresh', AuthController.refresh);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

// POST /api/auth/reset-password-request
router.post('/reset-password-request', AuthController.requestReset);

// POST /api/auth/reset-password
router.post('/reset-password', AuthController.resetPassword);

export default router;
