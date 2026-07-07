import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Mail, Lock, GraduationCap, ArrowRight, UserPlus, Shield, Eye, EyeOff } from 'lucide-react';
import { ROLE_GROUPS } from '../types/roles';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';
import { useLogo } from '../contexts/LogoContext';

const Login = () => {
  const { t } = useTranslation();
  const { logoUrl } = useLogo();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeRole, setActiveRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();

  const roles = [
    { id: 'ADMIN', label: 'Admin', icon: Shield },
    { id: 'PERSONNEL', label: 'Personnel', icon: Briefcase },
    { id: 'PARENTS', label: 'Parents', icon: Users },
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
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0F1B33 0%, #1B2A4A 40%, #0a0f1a 100%)' }}>
      {/* Left column — Branding */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(160deg, #1B2A4A 0%, #0F1B33 60%, #0a0f1a 100%)' }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border border-white/20" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full border border-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-32 h-32 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #4A7DC9, #2C4A7C)' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2.5" />
            ) : (
              <GraduationCap size={52} className="text-white" />
            )}
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">École Excellence</h1>
          <p className="text-lg text-white/50 max-w-md mx-auto leading-relaxed">
            Plateforme de gestion scolaire nouvelle génération
          </p>
        </div>
      </div>

      {/* Right column — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl p-8 md:p-10 backdrop-blur-xl border border-white/10 shadow-2xl"
            style={{ background: 'rgba(27, 42, 74, 0.6)' }}>

            {/* Icon */}
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #4A7DC9, #2C4A7C)' }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" />
              ) : (
                <GraduationCap size={26} className="text-white" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-1">Bienvenue</h2>
            <p className="text-sm text-white/50 text-center mb-8">Connectez-vous à votre espace sécurisé</p>

            {/* Role tabs */}
            <div className="flex gap-2 mb-8">
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-white shadow-lg shadow-blue-900/30'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, #4A7DC9, #2C4A7C)' } : {}}
                  >
                    <Icon size={15} />
                    {role.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#4A7DC9'; e.currentTarget.style.background = 'rgba(74,125,201,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                  <Mail size={16} className="text-white/40 shrink-0" />
                  <input
                    type="email"
                    placeholder="Adresse email"
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#4A7DC9'; e.currentTarget.style.background = 'rgba(74,125,201,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                  <Lock size={16} className="text-white/40 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/30 hover:text-white/60 transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)}
                  className="w-3.5 h-3.5 rounded border-white/20 bg-transparent"
                  style={{ accentColor: '#4A7DC9' }} />
                Se souvenir de moi
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #4A7DC9, #2C4A7C)' }}
              >
                Se connecter <ArrowRight size={16} />
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-xs text-white/30 font-medium">OU</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <button
              onClick={() => navigate('/register')}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5 flex items-center justify-center gap-2"
              style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
            >
              <UserPlus size={15} /> Créer un nouveau compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
