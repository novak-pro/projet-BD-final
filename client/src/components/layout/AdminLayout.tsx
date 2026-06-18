import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, BookOpen,
  Calendar, GraduationCap, ShieldCheck, Globe, LogOut, ChevronRight
} from 'lucide-react';

const menuItems = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard',             path: '/admin' },
  { icon: <Users size={18} />,          label: 'Gestion des Élèves',      path: '/admin/enrollments' },
  { icon: <GraduationCap size={18} />,  label: 'Personnel & RH',          path: '/admin/personnel' },
  { icon: <Building2 size={18} />,      label: 'Infrastructure',          path: '/admin/infrastructure' },
  { icon: <BookOpen size={18} />,       label: 'Matières & Épreuves',     path: '/admin/matieres' },
  { icon: <Calendar size={18} />,       label: 'Emploi du temps',         path: '/admin/planning' },
  { icon: <ShieldCheck size={18} />,    label: 'Discipline',              path: '/admin/discipline' },
  { icon: <GraduationCap size={18} />,  label: 'Scolarité & Finance',     path: '/admin/finance' },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#f4f7fe]">
      
      {/* ── Sidebar (Style Image 2 : Blanche, Fixe, Droite) ── */}
      <aside className="w-64 bg-white shadow-xl flex flex-col z-10 border-r border-gray-100">
        
        {/* Logo Area */}
        <div className="p-6 border-b flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-2 shadow-lg">
             <GraduationCap size={30} />
          </div>
          <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Admin EduManager</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <p className="px-6 text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-wider">Main Menu</p>
          
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-6 py-3 transition-all ${
                    isActive 
                      ? 'text-blue-600 border-r-4 border-blue-600 bg-blue-50/50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Footer Sidebar */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#2185d0] rounded-full flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-700 truncate">Administrateur</p>
              <p className="text-[10px] text-gray-400">En ligne</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-red-500 text-xs font-bold hover:underline w-full">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header (Style Image 3 : Bleu, Pleine Largeur) */}
        <header className="bg-[#2185d0] h-14 flex items-center justify-between px-6 text-white shadow-md">
          <div className="flex items-center gap-4">
             <LayoutDashboard size={18} />
             <span className="font-medium text-sm tracking-wide uppercase">Tableau de Bord</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
             <Link to="/" className="flex items-center gap-2 hover:text-blue-200 transition-colors">
                <Globe size={16} />
                <span className="hidden md:inline">Lihat Website</span>
             </Link>
             
             <div className="flex items-center gap-3 border-l border-white/20 pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] leading-tight opacity-80">Selamat datang,</p>
                  <p className="text-xs font-bold leading-tight">Admin</p>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center border border-white/30">
                  <Users size={16} />
                </div>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f4f7fe]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
               {menuItems.find(m => m.path === location.pathname)?.label || 'Administration'}
            </h2>
          </div>
          
          {/* C'est ici que les pages comme AdminDashboard s'afficheront */}
          <Outlet />
        </main>

        {/* Footer style Masantren */}
        <footer className="bg-white py-3 px-6 border-t text-[10px] text-gray-400 flex justify-between">
           <span>© 2024 EduManager Pro - ERP Scolaire</span>
           <span className="font-bold">Version 1.0.0</span>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;