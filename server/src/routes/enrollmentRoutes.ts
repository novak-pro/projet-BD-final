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
  getAllClasses,
  createClasse,
  updateClasse,
  deleteClasse,
  getCycles,
  createCycle,
  updateCycle,
  deleteCycle,
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

// Cycles CRUD
router.get('/cycles', authenticateToken, getCycles);
router.post('/cycles', authenticateToken, isAdmin, createCycle);
router.put('/cycles/:id', authenticateToken, isAdmin, updateCycle);
router.delete('/cycles/:id', authenticateToken, isAdmin, deleteCycle);

// Classes CRUD
router.get('/classes', authenticateToken, getAllClasses);
router.post('/classes', authenticateToken, isAdmin, createClasse);
router.put('/classes/:id', authenticateToken, isAdmin, updateClasse);
router.delete('/classes/:id', authenticateToken, isAdmin, deleteClasse);

export default router;