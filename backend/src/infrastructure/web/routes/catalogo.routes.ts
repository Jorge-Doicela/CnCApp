import { Router } from 'express';
import { CatalogoController } from '../controllers/catalogo.controller';

const router = Router();
const catalogoController = new CatalogoController();

// Endpoints públicos de datos de referencia (sin autenticación)
router.get('/generos', catalogoController.getGeneros);
router.get('/etnias', catalogoController.getEtnias);
router.get('/tipos-participante', catalogoController.getTiposParticipante);
router.get('/nacionalidades', catalogoController.getNacionalidades);
router.get('/public/cargos', catalogoController.getCargos);
router.get('/public/entidades', catalogoController.getEntidades);
router.get('/public/instituciones', catalogoController.getInstituciones);
router.get('/public/mancomunidades', catalogoController.getMancomunidades);
router.get('/public/competencias', catalogoController.getCompetencias);
router.get('/public/grados-ocupacionales', catalogoController.getGradosOcupacionales);

export { router as catalogoRoutes };
