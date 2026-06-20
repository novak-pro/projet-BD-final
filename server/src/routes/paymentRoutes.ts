import { Router } from 'express';
import { initiatePayment, getPayments, getStudentFeeConfig, validatePayment, getAllFeeConfigs, createFeeConfig } from '../controllers/paymentController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();
router.post('/', protect, restrictTo('PARENT'), initiatePayment);
router.post('/initiate', protect, restrictTo('PARENT'), initiatePayment);
router.get('/my-payments', protect, getPayments);
router.get('/all', protect, restrictTo('ADMIN_PRINCIPAL'), getPayments);
router.get('/history/:parentId', protect, restrictTo('PARENT'), getPayments);
router.get('/config/:matricule', protect, getStudentFeeConfig);
router.patch('/:id/validate', protect, restrictTo('ADMIN_PRINCIPAL'), validatePayment);
router.get('/config', protect, restrictTo('ADMIN_PRINCIPAL'), getAllFeeConfigs);
router.post('/config', protect, restrictTo('ADMIN_PRINCIPAL'), createFeeConfig);
export default router;