import { Router } from 'express';
import { container } from 'tsyringe';
import { EncuestaController } from '../controllers/encuesta.controller';
import { authenticate, requireModule } from '../middleware/auth.middleware';

const router = Router();
const controller = container.resolve(EncuestaController);

// Rutas públicas/participantes (con auth)
router.get('/capacitacion/:capacitacionId', authenticate, controller.getEncuestaByCapacitacion);
router.post('/respuesta', authenticate, controller.submitRespuesta);
router.get('/:id/responded', authenticate, controller.checkIfResponded);

// Rutas administrativas
router.get('/:id/resultados', [authenticate, requireModule('Gestionar capacitaciones')], controller.getResultados);

export default router;
