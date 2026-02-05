import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const userController = container.resolve(UserController);

router.use(authenticate); // Protect all user routes

router.get('/', userController.getAll);
router.get('/count', userController.count);
router.get('/auth/:authId', userController.getByAuthId);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;
