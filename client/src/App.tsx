import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AdminLayout from './components/layout/AdminLayout';
import ParentLayout from './components/layout/ParentLayout';
import TeacherLayout from './components/layout/TeacherLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages publiques
import Login    from './pages/Login';
import Register from './pages/Register';

// Pages admin
import AdminDashboard      from './pages/AdminDashboard';
import AdminFeeConfig      from './pages/AdminFeeConfig';
import AdminInfrastructure from './pages/admin/Infrastructure';
import MatierePage         from './pages/admin/MatierePage';
import PersonnelPage       from './pages/admin/PersonnelPage';
import PlanningPage        from './pages/admin/PlanningPage';
import BulletinPage        from './pages/admin/BulletinPage';
import DisciplinePage      from './pages/admin/DisciplinePage';
import StudentList         from './pages/StudentList';
import BibliothequePage    from './pages/admin/BibliothequePage';
import AdminPayments       from './pages/admin/AdminPayments';
import AdminMessages       from './pages/admin/AdminMessages';
import AdminAcademique     from './pages/admin/AdminAcademique';
import AdminScolarite      from './pages/admin/AdminScolarite';
import AdminDeactivatedAccounts from './pages/admin/AdminDeactivatedAccounts';

// Pages enseignant
import EpreuvePage       from './pages/teacher/EpreuvePage';
import TeacherDashboard  from './pages/teacher/TeacherDashboard';
import CourseDetail      from './pages/teacher/CourseDetail';
import TeacherDiscipline from './pages/teacher/TeacherDiscipline';
import TeacherPlanning   from './pages/teacher/TeacherPlanning';
import TeacherGrades     from './pages/teacher/TeacherGrades';

// Pages parent
import ParentScolarite from './pages/ParentScolarite';
import ParentPayment from './pages/ParentPayment';
import ParentBibliotheque from './pages/ParentBibliotheque';
import ParentDiscipline from './pages/ParentDiscipline';
import ParentBulletins from './pages/ParentBulletins';
import ParentPlanning from './pages/ParentPlanning';
import ParentChildProfile from './pages/ParentChildProfile';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>

        {/* ── Pages publiques ── */}
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Pages admin (avec sidebar, réservé ADMIN_PRINCIPAL) ── */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN_PRINCIPAL']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"                element={<AdminDashboard />} />
            <Route path="/admin/finance"        element={<AdminScolarite />} />
            <Route path="/admin/paiements"      element={<AdminPayments />} />
            <Route path="/admin/infrastructure" element={<AdminInfrastructure />} />
            <Route path="/admin/matieres"       element={<MatierePage />} />
            <Route path="/admin/personnel"      element={<PersonnelPage />} />
            <Route path="/admin/planning"       element={<PlanningPage />} />
            <Route path="/admin/bulletins"      element={<BulletinPage />} />
            <Route path="/admin/discipline"     element={<DisciplinePage />} />
            <Route path="/admin/students"       element={<StudentList />} />
            <Route path="/admin/bibliotheque"   element={<BibliothequePage />} />
            <Route path="/admin/messages"      element={<AdminMessages />} />
            <Route path="/admin/academique"    element={<AdminAcademique />} />
            <Route path="/admin/deactivated"   element={<AdminDeactivatedAccounts />} />

            <Route path="/students"             element={<StudentList />} />
          </Route>
        </Route>

        {/* ── Pages enseignant (réservé PERSONNEL) ── */}
        <Route element={<ProtectedRoute allowedRoles={['PERSONNEL']} />}>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard"    element={<TeacherDashboard />} />
            <Route path="/teacher/cours/:idCours" element={<CourseDetail />} />
            <Route path="/teacher/epreuves"     element={<EpreuvePage />} />
            <Route path="/teacher/discipline"   element={<TeacherDiscipline />} />
            <Route path="/teacher/planning"     element={<TeacherPlanning />} />
            <Route path="/teacher/grades"       element={<TeacherGrades />} />
          </Route>
        </Route>

        {/* ── Pages parent (réservé PARENT) ── */}
        <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
          <Route element={<ParentLayout />}>
            <Route path="/parent/scolarite" element={<ParentScolarite />} />
            <Route path="/parent/paiements" element={<ParentPayment />} />
            <Route path="/parent/bibliotheque" element={<ParentBibliotheque />} />
            <Route path="/parent/discipline" element={<ParentDiscipline />} />
            <Route path="/parent/bulletins" element={<ParentBulletins />} />
            <Route path="/parent/planning" element={<ParentPlanning />} />
            <Route path="/parent/enfant/:matricule" element={<ParentChildProfile />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;