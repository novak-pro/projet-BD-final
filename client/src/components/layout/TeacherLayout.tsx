import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  BookOpen, ClipboardList, FileText, ShieldAlert, Calendar, Menu, X, GraduationCap
} from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';
import SettingsDropdown from '../SettingsDropdown';
import { useTranslation } from '../../i18n/LanguageContext';
import { useLogo } from '../../contexts/LogoContext';

const TeacherLayout = () => {
  const { t } = useTranslation();
  const { logoUrl } = useLogo();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: <BookOpen size={18} />,     label: 'Mes Cours',         path: '/teacher/dashboard' },
    { icon: <ClipboardList size={18} />, label: 'Saisie des notes',  path: '/teacher/grades' },
    { icon: <FileText size={18} />,     label: 'Dépôt d\'épreuves', path: '/teacher/epreuves' },
    { icon: <ShieldAlert size={18} />,  label: 'Discipline',        path: '/teacher/discipline' },
    { icon: <Calendar size={18} />,     label: 'Emploi du temps',   path: '/teacher/planning' },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="admin-layout">
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo école" className="w-full h-full object-contain p-0.5" />
            ) : (
              <GraduationCap size={18} />
            )}
          </div>
          <div>
            <h2>EduManager</h2>
            <span>{t('teacher.title')}</span>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">{t('nav.mainMenu')}</div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <SettingsDropdown sidebar />
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <button className="admin-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h1>{t('teacher.title')}</h1>
          </div>
          <div className="admin-topbar-actions">
            <LanguageSwitcher />
            <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid var(--border-color)' }}>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500 leading-tight">{t('common.welcome')},</p>
                <p className="text-sm font-bold leading-tight text-gray-800">{user.nom || 'Enseignant'}</p>
              </div>
              <div className="w-9 h-9 bg-[var(--navy)] rounded-lg flex items-center justify-center text-white shadow-sm">
                <GraduationCap size={16} />
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>

        <footer className="py-3 px-6 border-t text-xs flex justify-between" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
          <span>{t('app.copyright')}</span>
          <span className="font-bold">{t('app.version')}</span>
        </footer>
      </div>
    </div>
  );
};

export default TeacherLayout;
