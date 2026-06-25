import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Briefcase, Users, Mail, Lock } from 'lucide-react';
import { ROLE_GROUPS } from '../types/roles';
import api from '../services/axiosInstance';
import LanguageSwitcher from '../components/LanguageSwitcher';
import BrandHeader from '../components/BrandHeader';
import { useTranslation } from '../i18n/LanguageContext';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeRole, setActiveRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const roles = [
    { id: 'ADMIN', label: 'ADMIN', icon: ShieldCheck },
    { id: 'PERSONNEL', label: 'PERSONNEL', icon: Briefcase },
    { id: 'PARENTS', label: 'PARENTS', icon: Users },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      const userRole = data.user.role;
      const allowedRoles = ROLE_GROUPS[activeRole];

      if (!allowedRoles.includes(userRole)) {
        setError(t('auth.errorAccess'));
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', userRole);

      if (userRole === 'ADMIN_PRINCIPAL') navigate('/admin');
      else if (userRole === 'PERSONNEL') navigate('/teacher/dashboard');
      else if (userRole === 'PARENT') navigate('/parent/scolarite');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.errorServer'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1a2a4a 100%)' }}>
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher className="text-white/60 hover:text-white" />
      </div>

      <div className="w-full max-w-md">
        <BrandHeader subtitle="Connectez-vous à votre espace" />

        <div className="bg-white rounded-2xl shadow-xl shadow-black/10">
          <div className="px-8 py-8">
            <h2 className="text-lg font-semibold text-center mb-6" style={{ color: '#0f172a' }}>Connexion</h2>

            <div className="flex gap-2 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                    style={isActive ? { background: '#0f172a' } : {}}
                  >
                    <Icon size={14} />
                    {role.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none text-sm transition-all placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                    onFocus={(e) => { e.target.style.borderColor = '#0f172a'; e.target.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Mot de passe</label>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none text-sm transition-all placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                    onFocus={(e) => { e.target.style.borderColor = '#0f172a'; e.target.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: '#0f172a' }}
              >
                {t('auth.signInBtn')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/register')}
                className="text-xs transition-colors text-slate-400 hover:text-slate-600"
              >
                {t('auth.noAccountRegister')}{' '}
                <span className="underline font-semibold" style={{ color: '#0f172a' }}>{t('auth.noAccountRegisterLink')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
