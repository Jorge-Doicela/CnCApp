import { Router } from 'express';
import { container } from 'tsyringe';
import { CompetenciaController } from '../controllers/competencia.controller';

const router = Router();
const competenciaController = container.resolve(CompetenciaController);

router.get('/', competenciaController.getAll.bind(competenciaController));
router.get('/:id', competenciaController.getById.bind(competenciaController));
router.post('/', competenciaController.create.bind(competenciaController));
router.put('/:id', competenciaController.update.bind(competenciaController));
router.delete('/:id', competenciaController.delete.bind(competenciaController));

export default router;
