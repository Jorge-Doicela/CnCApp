import { Router } from 'express';

const router = Router();

// TODO: Implementar rutas de certificados
router.get('/', (_req, res) => {
    res.json({ message: 'Certificado routes - Coming soon' });
});

export default router;
