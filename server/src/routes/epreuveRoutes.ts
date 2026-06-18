import { Router } from 'express';
import { deposerEpreuve } from '../controllers/epreuve.controller';
import { protect, restrictTo} from '../middlewares/authMiddleware';

const router = Router();
router.post('/', protect, restrictTo('professeur'), deposerEpreuve);
export default router;
