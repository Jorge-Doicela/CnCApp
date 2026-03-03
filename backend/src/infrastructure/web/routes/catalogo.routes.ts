import { Router } from 'express';
import { CatalogoController } from '../controllers/catalogo.controller';

const router = Router();
const catalogoController = new CatalogoController();

router.get('/generos', catalogoController.getGeneros.bind(catalogoController));
router.get('/etnias', catalogoController.getEtnias.bind(catalogoController));
router.get('/tipos-participante', catalogoController.getTiposParticipante.bind(catalogoController));
router.get('/nacionalidades', catalogoController.getNacionalidades.bind(catalogoController));
router.get('/public/cargos', catalogoController.getCargos.bind(catalogoController));
router.get('/public/entidades', catalogoController.getEntidades.bind(catalogoController));
router.get('/public/instituciones', catalogoController.getInstituciones.bind(catalogoController));
router.get('/public/mancomunidades', catalogoController.getMancomunidades.bind(catalogoController));
router.get('/public/competencias', catalogoController.getCompetencias.bind(catalogoController));
router.get('/public/grados-ocupacionales', catalogoController.getGradosOcupacionales.bind(catalogoController));

export { router as catalogoRoutes };
