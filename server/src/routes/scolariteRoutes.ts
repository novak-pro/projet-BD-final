import { Router } from 'express';
import {
  getAllScolarites, getScolariteByClasse, createScolarite,
  updateScolarite, deleteScolarite,
  createTranche, updateTranche, deleteTranche,
} from '../controllers/scolarite.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, getAllScolarites);
router.get('/classe/:classeId', protect, getScolariteByClasse);
router.post('/', protect, restrictTo('ADMIN_PRINCIPAL'), createScolarite);
router.put('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateScolarite);
router.delete('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteScolarite);

router.post('/tranches', protect, restrictTo('ADMIN_PRINCIPAL'), createTranche);
router.put('/tranches/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateTranche);
router.delete('/tranches/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteTranche);

export default router;
