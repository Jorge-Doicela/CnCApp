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

// --- Rutas de gestión (Solo STAFF) — ESPECÍFICAS antes de los params genéricos ---
// IMPORTANTE: /no-asistieron/:id y /relacion/:id deben ir ANTES de /:idCapacitacion/:idUsuario
// para que Express no interprete 'no-asistieron' o 'relacion' como :idCapacitacion
router.delete('/no-asistieron/:id', authorize(...STAFF_ROLES), controller.eliminarNoAsistieron.bind(controller));
router.delete('/relacion/:id', authorize(...STAFF_ROLES), controller.eliminarPorRelacion.bind(controller));
router.put('/asistencia-masiva/:id', authorize(...STAFF_ROLES), controller.actualizarAsistenciaMasiva.bind(controller));
router.put('/asistencia/:id', authorize(...STAFF_ROLES), controller.actualizarAsistencia.bind(controller));
router.get('/:id', authorize(...STAFF_ROLES), controller.getInscritos.bind(controller));
router.get('/', authorize(...STAFF_ROLES), controller.getByFilters.bind(controller));

// --- Rutas de usuario (acceso propio) ---
// GET /usuario/:idUsuario → historial de inscripciones del usuario
router.get('/usuario/:idUsuario', controller.getByUsuarioId.bind(controller));

// POST / → inscribir usuario
router.post('/', controller.inscribir.bind(controller));

// DELETE /:idCapacitacion/:idUsuario → cancelar inscripción (al final para no capturar rutas de arriba)
router.delete('/:idCapacitacion/:idUsuario', controller.cancelarInscripcion.bind(controller));

export default router;
