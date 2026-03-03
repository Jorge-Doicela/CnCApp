import { Router } from 'express';
import { container } from 'tsyringe';
import { UsuarioCapacitacionController } from '../controllers/usuario-capacitacion.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(UsuarioCapacitacionController);

const STAFF_ROLES = [ROLES.ADMINISTRADOR, ROLES.CONFERENCISTA];

// Todas las rutas requieren autenticación
router.use(authenticate);

// --- Rutas específicas PRIMERO (antes de /:id genérico) ---

// GET /usuario/:idUsuario → historial de inscripciones del usuario (acceso propio)
router.get('/usuario/:idUsuario', controller.getByUsuarioId.bind(controller));

// POST / → inscribir usuario (acceso propio)
router.post('/', controller.inscribir.bind(controller));

// DELETE /:idCapacitacion/:idUsuario → cancelar inscripción  
router.delete('/:idCapacitacion/:idUsuario', controller.cancelarInscripcion.bind(controller));

// --- Rutas de gestión (Solo STAFF) ---
router.put('/asistencia-masiva/:id', authorize(...STAFF_ROLES), controller.actualizarAsistenciaMasiva.bind(controller));
router.put('/asistencia/:id', authorize(...STAFF_ROLES), controller.actualizarAsistencia.bind(controller));
router.delete('/no-asistieron/:id', authorize(...STAFF_ROLES), controller.eliminarNoAsistieron.bind(controller));
router.delete('/relacion/:id', authorize(...STAFF_ROLES), controller.eliminarPorRelacion.bind(controller));
router.get('/:id', authorize(...STAFF_ROLES), controller.getInscritos.bind(controller));
router.get('/', authorize(...STAFF_ROLES), controller.getByFilters.bind(controller));

export default router;
