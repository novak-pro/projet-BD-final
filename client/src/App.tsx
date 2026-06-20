import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AdminLayout from './components/layout/AdminLayout';
import ParentLayout from './components/layout/ParentLayout';
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

// Pages enseignant
import EpreuvePage from './pages/teacher/EpreuvePage';

// Pages parent
import ParentScolarite from './pages/ParentScolarite';
import ParentPayment from './pages/ParentPayment';
import ParentBibliotheque from './pages/ParentBibliotheque';
import ParentDiscipline from './pages/ParentDiscipline';
import ParentBulletins from './pages/ParentBulletins';
import ParentPlanning from './pages/ParentPlanning';

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Pages publiques ── */}
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Pages admin (avec sidebar, réservé ADMIN_PRINCIPAL) ── */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN_PRINCIPAL']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"                element={<AdminDashboard />} />
            <Route path="/admin/finance"        element={<AdminFeeConfig />} />
            <Route path="/admin/paiements"      element={<AdminPayments />} />
            <Route path="/admin/infrastructure" element={<AdminInfrastructure />} />
            <Route path="/admin/matieres"       element={<MatierePage />} />
            <Route path="/admin/personnel"      element={<PersonnelPage />} />
            <Route path="/admin/planning"       element={<PlanningPage />} />
            <Route path="/admin/bulletins"      element={<BulletinPage />} />
            <Route path="/admin/discipline"     element={<DisciplinePage />} />
            <Route path="/admin/students"       element={<StudentList />} />
            <Route path="/admin/bibliotheque"   element={<BibliothequePage />} />
            <Route path="/students"             element={<StudentList />} />
          </Route>
        </Route>

        {/* ── Pages enseignant (réservé PERSONNEL) ── */}
        <Route element={<ProtectedRoute allowedRoles={['PERSONNEL']} />}>
          <Route path="/teacher/epreuves" element={<EpreuvePage />} />
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
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;