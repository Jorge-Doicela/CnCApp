import { Router } from 'express';
import { container } from 'tsyringe';
import { CompetenciaController } from '../controllers/competencia.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ADMIN_ROLES } from '../../../domain/shared/constants/roles.constants';

const router = Router();
const competenciaController = container.resolve(CompetenciaController);

router.use(authenticate);
router.use(authorize(...ADMIN_ROLES));

router.get('/', competenciaController.getAll.bind(competenciaController));
router.get('/:id', competenciaController.getById.bind(competenciaController));
router.post('/', competenciaController.create.bind(competenciaController));
router.put('/:id', competenciaController.update.bind(competenciaController));
router.delete('/:id', competenciaController.delete.bind(competenciaController));

export default router;
