import { useRef, useState, useEffect } from 'react';
import { Settings, Sun, Moon, LogOut, Languages, Image } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useLogo } from '../contexts/LogoContext';

const SettingsDropdown = ({ sidebar }: { sidebar?: boolean }) => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useTranslation();
  const { logoUrl, setLogoUrl } = useLogo();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div ref={ref} className={`relative ${sidebar ? 'w-full' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className={sidebar
          ? 'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-semibold'
          : 'p-2 rounded-lg hover:bg-gray-100 transition-colors'
        }
        title="Paramètres"
      >
        <Settings size={sidebar ? 20 : 18} />
        {sidebar && <span>Paramètres</span>}
      </button>

      {open && (
        <div className={`absolute ${sidebar ? 'left-0 bottom-full mb-2' : 'right-0 top-full mt-2'} w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50`}>
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paramètres</p>
          </div>

          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            {theme === 'light' ? <Moon size={16} className="text-indigo-500" /> : <Sun size={16} className="text-amber-500" />}
            <span className="flex-1 text-left">{theme === 'light' ? 'Mode sombre' : 'Mode clair'}</span>
            <div className={`relative w-9 h-5 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${theme === 'dark' ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
          </button>

          <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Languages size={16} className="text-blue-500" />
            <span className="flex-1 text-left">Langue / Language</span>
            <span className="text-xs font-bold uppercase tracking-wider">
              <span className={lang === 'fr' ? 'text-gray-900' : 'text-gray-400'}>FR</span>
              <span className="text-gray-300 mx-1">|</span>
              <span className={lang === 'en' ? 'text-gray-900' : 'text-gray-400'}>EN</span>
            </span>
          </button>

          {role === 'ADMIN_PRINCIPAL' && (
            <>
              <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Image size={16} className="text-emerald-500" />
                <span className="flex-1 text-left">{logoUrl ? 'Changer le logo' : 'Ajouter un logo'}</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />

              {logoUrl && (
                <button onClick={handleRemoveLogo} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <span className="flex-1 text-left pl-7">Retirer le logo</span>
                </button>
              )}
            </>
          )}

          <div className="border-t border-gray-100 my-1" />

          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
