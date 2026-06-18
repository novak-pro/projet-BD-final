import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Briefcase, Users } from 'lucide-react';
import { ROLE_GROUPS } from '../types/roles';

const Login = () => {
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
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        const userRole = data.user.role;
        const allowedRoles = ROLE_GROUPS[activeRole];

        if (!allowedRoles.includes(userRole)) {
          setError("Ce compte n'a pas accès à cet espace de connexion.");
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', userRole);

        if (userRole === 'ADMIN_PRINCIPAL') navigate('/admin');
        else navigate('/dashboard');
      } else {
        setError(data.error || "Identifiants invalides");
      }
    } catch (err) {
      setError("Serveur indisponible.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── BANDEAU LOGO (pleine largeur, fond blanc) ── */}
      <div className="w-full bg-white py-12 flex justify-center items-center border-b-4 border-red-600 shadow-md">
        <div className="flex items-center gap-3">
          <div className="text-blue-900">
            <GraduationCap size={56} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-4xl font-black italic text-red-600 tracking-tighter">School</span>
            <span className="text-lg font-bold tracking-[0.3em] text-blue-900 ml-1">PORTAL</span>
          </div>
        </div>
      </div>

      {/* ── SECTION FOND (tabs + formulaire) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 bg-gray-700 relative">
        {/* ── TABS (boutons pilules indépendants) ── */}
        <div className="flex gap-2 mb-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-bold transition-all ${
                  activeRole === role.id
                    ? 'bg-[#3182ce] text-white shadow-lg'
                    : 'bg-[#1a202c] text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={14} />
                {role.label}
              </button>
            );
          })}
        </div>

        {/* ── CARTE FORMULAIRE (carrée, bordures nettes) ── */}
        <div className="w-full max-w-lg bg-white rounded-md shadow-2xl overflow-hidden">
          {/* En-tête LOGIN (bandeau interne) */}
          <div className="text-center py-4 border-b border-gray-200">
            <span className="text-sm font-light tracking-[0.3em] text-gray-500 uppercase">
              Login
            </span>
          </div>

          {/* Corps avec padding uniforme — tout le contenu respecte cette marge */}
          <div className="p-10">
            {error && (
              <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded mb-4">
                {error}
              </p>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full border border-gray-300 rounded px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 rounded px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0" />
                  <span className="group-hover:text-gray-700 transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-bold hover:text-blue-600 transition-colors uppercase tracking-wider"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#e53e3e] hover:bg-red-700 text-white font-bold py-3 rounded shadow-lg 
                           transition-all transform active:scale-95 uppercase tracking-[0.2em] text-sm mt-2"
              >
                Log In
              </button>
            </form>
          </div>
        </div>

        {/* Pied de page optionnel */}
        <div className="mt-6 mb-6 text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-white/60 text-xs hover:text-white transition-colors"
          >
            Besoin d'un compte ? <span className="underline font-bold">Faire une demande</span>
          </button>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/10 px-3 py-1 rounded text-[10px] text-white/50 backdrop-blur-sm">
          SECURED BY 🛡️ EDUMANAGER POSITIVE
        </div>
      </div>
    </div>
  );
};

export default Login;