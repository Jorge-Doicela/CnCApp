import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { RegisterController } from '../controllers/register.controller';

/**
 * Authentication Routes
 */
const router = Router();

// POST /api/auth/register
router.post('/register', RegisterController.register);

// POST /api/auth/login
router.post('/login', AuthController.login);

// POST /api/auth/refresh
router.post('/refresh', AuthController.refresh);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

export default router;
