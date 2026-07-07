import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { BookOpen, GraduationCap, CreditCard, Book, ShieldCheck, Calendar, Menu, X, User } from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';
import SettingsDropdown from '../SettingsDropdown';
import InboxDropdown from '../InboxDropdown';
import { useTranslation } from '../../i18n/LanguageContext';
import { useLogo } from '../../contexts/LogoContext';
import api from '../../services/axiosInstance';

interface Child {
  matricule: number;
  nom: string;
  prenom: string;
  niveau: string;
  photoURL: string | null;
}

const ParentLayout = () => {
  const { t } = useTranslation();
  const { logoUrl } = useLogo();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    api.get('/enrollments/my-children')
      .then(res => setChildren(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const menuItems = [
    { icon: <GraduationCap size={18} />, label: t('parent.scolarite'),   path: '/parent/scolarite' },
    { icon: <CreditCard size={18} />,    label: t('parent.payments'),    path: '/parent/paiements' },
    { icon: <Book size={18} />,          label: t('parent.library'),     path: '/parent/bibliotheque' },
    { icon: <ShieldCheck size={18} />,   label: t('parent.discipline'),  path: '/parent/discipline' },
    { icon: <BookOpen size={18} />,      label: t('parent.bulletins'),   path: '/parent/bulletins' },
    { icon: <Calendar size={18} />,      label: t('parent.planning'),    path: '/parent/planning' },
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
            <h2>École Excellence</h2>
            <span>{t('parent.title')}</span>
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

          {children.length > 0 && (
            <>
              <div className="admin-nav-section mt-4">Mes enfants</div>
              {children.map(child => {
                const childPath = `/parent/enfant/${child.matricule}`;
                const isChildActive = location.pathname === childPath;
                return (
                  <Link
                    key={child.matricule}
                    to={childPath}
                    onClick={() => setSidebarOpen(false)}
                    className={`admin-nav-item ${isChildActive ? 'active' : ''}`}
                  >
                    <span>
                      {child.photoURL ? (
                        <img src={child.photoURL} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={12} className="text-gray-500" />
                        </div>
                      )}
                    </span>
                    <span>{child.prenom} {child.nom}</span>
                  </Link>
                );
              })}
            </>
          )}
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
            <h1>{t('parent.title')}</h1>
          </div>
          <div className="admin-topbar-actions">
            <InboxDropdown />
            <LanguageSwitcher />
            <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid var(--border-color)' }}>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500 leading-tight">{t('common.welcome')},</p>
                <p className="text-sm font-bold leading-tight text-gray-800">{user.nom || 'Parent'}</p>
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


      </div>
    </div>
  );
};

export default ParentLayout;
