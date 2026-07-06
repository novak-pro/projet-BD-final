import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen,
  Calendar, GraduationCap, ShieldCheck, CreditCard, Menu, X, Building2, MessageSquare, FileText
} from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';
import SettingsDropdown from '../SettingsDropdown';
import { useTranslation } from '../../i18n/LanguageContext';
import { useLogo } from '../../contexts/LogoContext';

const AdminLayout = () => {
  const { t } = useTranslation();
  const { logoUrl } = useLogo();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: t('nav.dashboard'),     path: '/admin' },
    { icon: <Users size={18} />,           label: t('nav.students'),      path: '/admin/students' },
    { icon: <GraduationCap size={18} />,   label: t('nav.personnel'),     path: '/admin/personnel' },
    { icon: <Building2 size={18} />,       label: t('nav.infrastructure'), path: '/admin/infrastructure' },
    { icon: <BookOpen size={18} />,        label: t('nav.subjects'),      path: '/admin/matieres' },
    { icon: <Calendar size={18} />,        label: t('nav.schedule'),      path: '/admin/planning' },
    { icon: <ShieldCheck size={18} />,     label: t('nav.discipline'),    path: '/admin/discipline' },
    { icon: <GraduationCap size={18} />,   label: t('nav.finance'),       path: '/admin/finance' },
    { icon: <CreditCard size={18} />,      label: t('nav.payments'),      path: '/admin/paiements' },
    { icon: <BookOpen size={18} />,        label: t('nav.library'),       path: '/admin/bibliotheque' },
    { icon: <Calendar size={18} />,        label: 'Années académiques',  path: '/admin/academique' },
    { icon: <MessageSquare size={18} />,   label: 'Messagerie',          path: '/admin/messages' },
  ];

  const currentPage = menuItems.find(m => m.path === location.pathname);

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
            <span>{t('admin.title')}</span>
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
            <h1>{currentPage?.label || t('admin.dashboardShort')}</h1>
          </div>
          <div className="admin-topbar-actions">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm">
              <span>{t('common.viewSite')}</span>
            </Link>
            <LanguageSwitcher />
            <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid var(--border-color)' }}>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500 leading-tight">{t('admin.welcome')}</p>
                <p className="text-sm font-bold leading-tight text-gray-800">Admin</p>
              </div>
              <div className="w-9 h-9 bg-[var(--navy)] rounded-lg flex items-center justify-center text-white shadow-sm">
                <Users size={16} />
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

export default AdminLayout;
