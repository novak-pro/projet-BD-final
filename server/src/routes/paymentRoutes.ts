import { Router } from 'express';
import {initiatePayment  , getPayments} from '../controllers/paymentController';
import {protect, restrictTo} from '../middlewares/authMiddleware';

const router = Router();
router.post('/', protect, restrictTo('parent'), initiatePayment);
router.get('/history/:parentId', protect, restrictTo('parent'), getPayments);
export default router;