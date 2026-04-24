import { Router } from 'express';
import { container } from 'tsyringe';
import { UsuarioCapacitacionController } from '../controllers/usuario-capacitacion.controller';
import { authenticate, authorize, requireModule } from '../middleware/auth.middleware';
import { ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const controller = container.resolve(UsuarioCapacitacionController);

// const STAFF_ROLES = [ROLES.ADMINISTRADOR, ROLES.CONFERENCISTA];

// Todas las rutas requieren autenticación
router.use(authenticate);

// --- Rutas de confirmación QR (todos los usuarios autenticados) ---
// Esta ruta DEBE ir antes de las rutas con parámetros para evitar colisiones
router.post('/confirmar-asistencia-qr', controller.confirmarAsistenciaQR.bind(controller));

// --- Rutas de gestión (Solo STAFF con permiso de gestión) — ESPECÍFICAS antes de los params genéricos ---
router.delete('/no-asistieron/:id', requireModule('Gestionar capacitaciones'), controller.eliminarNoAsistieron.bind(controller));
router.delete('/relacion/:id', requireModule('Gestionar capacitaciones'), controller.eliminarPorRelacion.bind(controller));
router.put('/asistencia-masiva/:id', requireModule('Gestionar capacitaciones'), controller.actualizarAsistenciaMasiva.bind(controller));
router.put('/asistencia/:id', requireModule('Gestionar capacitaciones'), controller.actualizarAsistencia.bind(controller));
router.get('/:id', requireModule('Gestionar capacitaciones'), controller.getInscritos.bind(controller));
router.get('/', requireModule('Gestionar capacitaciones'), controller.getByFilters.bind(controller));

// --- Rutas de usuario (acceso propio) ---
router.get('/usuario/:idUsuario', controller.getByUsuarioId.bind(controller));

// POST / → inscribir usuario
router.post('/', controller.inscribir.bind(controller));

// DELETE /:idCapacitacion/:idUsuario → cancelar inscripción
router.delete('/:idCapacitacion/:idUsuario', controller.cancelarInscripcion.bind(controller));

export default router;
