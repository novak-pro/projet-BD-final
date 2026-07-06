import { Router } from 'express';
import {
  getAllPersonnel, updatePersonnel, deactivatePersonnel,
  promouvoirTitulaire, retirerPromotion,
  affecterEnseignantSalle, getCoursEnseignant,
} from '../controllers/personnel.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.get('/', protect, restrictTo('ADMIN_PRINCIPAL'), getAllPersonnel);
router.put('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updatePersonnel);
router.post('/:id/deactivate', protect, restrictTo('ADMIN_PRINCIPAL'), deactivatePersonnel);

router.post('/promouvoir-titulaire', protect, restrictTo('ADMIN_PRINCIPAL'), promouvoirTitulaire);
router.delete('/retirer-promotion/:personnelId', protect, restrictTo('ADMIN_PRINCIPAL'), retirerPromotion);

router.post('/affecter-salle', protect, restrictTo('ADMIN_PRINCIPAL'), affecterEnseignantSalle);
router.get('/:personnelId/cours', protect, getCoursEnseignant);

export default router;
