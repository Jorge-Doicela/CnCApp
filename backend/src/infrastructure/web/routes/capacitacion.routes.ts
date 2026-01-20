import { Router } from 'express';

const router = Router();

// TODO: Implementar rutas de capacitaciones
router.get('/', (_req, res) => {
    res.json({ message: 'Capacitacion routes - Coming soon' });
});

export default router;
