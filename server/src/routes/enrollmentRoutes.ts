import { Router } from 'express';
import { 
  submitEnrollment, 
  processEnrollment, 
  getEnrollments,
  getMyChildren,
  getChildProfile,
  updateChildPhoto,
  updateChildSchoolInfo,
  updateChildSchoolInfoAdmin,
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

// Profil complet d'un enfant
router.get('/child/:matricule', authenticateToken, getChildProfile);

// Upload photo enfant
router.patch('/child/:matricule/photo', authenticateToken, updateChildPhoto);

// Mise à jour des infos scolaires (parent)
router.patch('/child/:matricule/school', authenticateToken, updateChildSchoolInfo);

// Mise à jour des infos scolaires (admin)
router.patch('/child/:matricule/school-admin', authenticateToken, isAdmin, updateChildSchoolInfoAdmin);

// Route pour lister les classes
router.get('/classes', authenticateToken, getAllClasses);

export default router;