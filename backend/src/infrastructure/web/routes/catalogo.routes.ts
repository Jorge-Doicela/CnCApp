import { Router } from 'express';
import { CatalogoController } from '../controllers/catalogo.controller';

const router = Router();
const catalogoController = new CatalogoController();

router.get('/generos', catalogoController.getGeneros.bind(catalogoController));
router.get('/etnias', catalogoController.getEtnias.bind(catalogoController));

export { router as catalogoRoutes };
