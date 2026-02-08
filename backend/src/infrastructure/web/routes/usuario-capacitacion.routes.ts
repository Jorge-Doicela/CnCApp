import { Router } from 'express';
import { container } from 'tsyringe';
import { UsuarioCapacitacionController } from '../controllers/usuario-capacitacion.controller';

const router = Router();
const controller = container.resolve(UsuarioCapacitacionController);

// Rutas mas específicas primero
router.put('/asistencia-masiva/:id', controller.actualizarAsistenciaMasiva.bind(controller));
router.put('/asistencia/:id', controller.actualizarAsistencia.bind(controller));
router.delete('/no-asistieron/:id', controller.eliminarNoAsistieron.bind(controller)); // id is idCapacitacion here
router.delete('/relacion/:id', controller.eliminarPorRelacion.bind(controller));
router.get('/usuario/:idUsuario', controller.getByFilters.bind(controller)); // mapped to filter for convenience or specialized method
router.delete('/:idCapacitacion/:idUsuario', controller.cancelarInscripcion.bind(controller));

// Rutas generales
router.get('/:id', controller.getInscritos.bind(controller)); // Get all enrolled in a capacitacion
router.get('/', controller.getByFilters.bind(controller)); // Query params
router.post('/', controller.inscribir.bind(controller));

export default router;
