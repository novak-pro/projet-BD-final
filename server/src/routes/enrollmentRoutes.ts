import { Router } from 'express';
import { 
  submitEnrollment, 
  processEnrollment, 
  getEnrollments,
  getMyChildren,
  getAllClasses 
} from '../controllers/enrollmentController';
import { protect, restrictTo, authenticateToken, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Route pour les parents : Soumettre et voir leurs demandes
router.post('/', authenticateToken, submitEnrollment);
router.get('/', authenticateToken, getEnrollments);

// Route pour l'admin : Traiter une demande
router.patch('/:id/process', authenticateToken, isAdmin, processEnrollment);

// Route pour les parents : Voir leurs enfants
router.get('/my-children', authenticateToken, getMyChildren);

// Route pour lister les classes
router.get('/classes', authenticateToken, getAllClasses);

export default router;