import { Router } from 'express';
import { getAllLivres, getLivreById, createLivre, updateLivre, deleteLivre } from '../controllers/bibliotheque.controller';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.get('/', protect, getAllLivres);
router.get('/:id', protect, getLivreById);
router.post('/', protect, restrictTo('ADMIN_PRINCIPAL'), createLivre);
router.put('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), updateLivre);
router.delete('/:id', protect, restrictTo('ADMIN_PRINCIPAL'), deleteLivre);

export default router;
