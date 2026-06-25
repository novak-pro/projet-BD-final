import { Router } from 'express';
import { createPlanning, updatePlanning, getPlanningByClasse, getPlanningByEleve, deletePlanning, getCoursByClasse, getPlanningBySalle, getCoursBySalle } from '../controllers/planning.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.post('/', protect, restrictTo('ADMIN_PRINCIPAL'), createPlanning);
router.put('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updatePlanning);
router.get('/classe/:idClasse', protect, restrictTo('ADMIN_PRINCIPAL', 'PERSONNEL'), getPlanningByClasse);
router.get('/cours/:idClasse', protect, restrictTo('ADMIN_PRINCIPAL'), getCoursByClasse);
router.get('/salle/:idSalle', protect, restrictTo('ADMIN_PRINCIPAL', 'PERSONNEL'), getPlanningBySalle);
router.get('/cours-salle/:idSalle', protect, restrictTo('ADMIN_PRINCIPAL'), getCoursBySalle);
router.get('/eleve/:eleveId', protect, getPlanningByEleve);
router.delete('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deletePlanning);
export default router;
