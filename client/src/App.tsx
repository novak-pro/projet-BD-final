import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AdminLayout from './components/layout/AdminLayout';

// Pages publiques
import Login    from './pages/Login';
import Register from './pages/Register';

// Pages admin
import AdminDashboard      from './pages/AdminDashboard';
import AdminEnrollments    from './pages/AdminEnrollments';
import AdminFeeConfig      from './pages/AdminFeeConfig';
import AdminInfrastructure from './pages/admin/Infrastructure';
import MatierePage         from './pages/admin/MatierePage';
import PersonnelPage       from './pages/admin/PersonnelPage';
import PlanningPage        from './pages/admin/PlanningPage';
import BulletinPage        from './pages/admin/BulletinPage';
import DisciplinePage      from './pages/admin/DisciplinePage';
import StudentList         from './pages/StudentList';

// Pages enseignant
import EpreuvePage from './pages/teacher/EpreuvePage';

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Pages publiques ── */}
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Pages admin (avec sidebar) ── */}
        <Route element={<AdminLayout />}>
          <Route path="/admin"                element={<AdminDashboard />} />
          <Route path="/admin/inscriptions"   element={<AdminEnrollments />} />
          <Route path="/admin/finance"        element={<AdminFeeConfig />} />
          <Route path="/admin/infrastructure" element={<AdminInfrastructure />} />
          <Route path="/admin/matieres"       element={<MatierePage />} />
          <Route path="/admin/personnel"      element={<PersonnelPage />} />
          <Route path="/admin/planning"       element={<PlanningPage />} />
          <Route path="/admin/bulletins"      element={<BulletinPage />} />
          <Route path="/admin/discipline"     element={<DisciplinePage />} />
          <Route path="/students"             element={<StudentList />} />
        </Route>

        {/* ── Pages enseignant ── */}
        <Route path="/teacher/epreuves" element={<EpreuvePage />} />

      </Routes>
    </Router>
  );
}

export default App;