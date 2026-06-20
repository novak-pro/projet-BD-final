import { Router } from 'express';
import { createPlanning, getPlanningByClasse, getPlanningByEleve, deletePlanning, getCoursByClasse } from '../controllers/planning.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.post('/', protect, restrictTo('ADMIN_PRINCIPAL'), createPlanning);
router.get('/classe/:idClasse', protect, restrictTo('ADMIN_PRINCIPAL', 'PERSONNEL'), getPlanningByClasse);
router.get('/cours/:idClasse', protect, restrictTo('ADMIN_PRINCIPAL'), getCoursByClasse);
router.get('/eleve/:eleveId', protect, getPlanningByEleve);
router.delete('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deletePlanning);
export default router;
