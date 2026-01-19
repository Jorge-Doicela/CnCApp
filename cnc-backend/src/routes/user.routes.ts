import { Router } from 'express';

const router = Router();

// TODO: Implementar rutas de usuarios
router.get('/', (req, res) => {
    res.json({ message: 'User routes - Coming soon' });
});

export default router;
