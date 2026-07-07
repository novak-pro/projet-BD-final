import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Briefcase, ArrowLeft, GraduationCap, MapPin, Home } from 'lucide-react';
import BrandHeader from '../components/BrandHeader';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SubmitBtn from '../components/SubmitBtn';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState<'PARENT' | 'PERSONNEL'>('PARENT');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    ville: '',
    quartier: '',
    fonction: 'ENSEIGNANT'
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/register', { ...formData, role });
      setMessage("✅ " + t('auth.registerSuccess'));
    } catch (err: any) {
      setMessage("❌ " + (err.response?.data?.error || t('auth.registerError')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1a2a4a 100%)' }}>
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher className="text-white/60 hover:text-white" />
      </div>

      <div className="w-full max-w-md">
        <BrandHeader subtitle="Créez votre compte" />

        <div className="bg-white rounded-2xl shadow-xl shadow-black/10">
          <div className="px-8 py-8">
            <h2 className="text-lg font-semibold text-center mb-6" style={{ color: '#0f172a' }}>{t('auth.registerTitle')}</h2>

            <div className="flex mb-6 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setRole('PARENT')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
                  role === 'PARENT' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'
                }`}
                style={role === 'PARENT' ? { color: '#0f172a' } : {}}
              >
                <User className="w-3.5 h-3.5" /> {t('auth.parentRegister')}
              </button>
              <button
                onClick={() => setRole('PERSONNEL')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
                  role === 'PERSONNEL' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
                style={role === 'PERSONNEL' ? { color: '#0f172a' } : {}}
              >
                <Briefcase className="w-3.5 h-3.5" /> {t('auth.staffRegister')}
              </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Nom</label>
                  <input type="text" placeholder={t('auth.registerNom')} required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none text-sm transition-all placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                    onFocus={(e) => { e.target.style.borderColor = '#0f172a'; e.target.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Prénom</label>
                  <input type="text" placeholder={t('auth.registerPrenom')} required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none text-sm transition-all placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                    onFocus={(e) => { e.target.style.borderColor = '#0f172a'; e.target.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input type="email" placeholder={t('auth.emailPlaceholder')} required
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none text-sm transition-all placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                    onFocus={(e) => { e.target.style.borderColor = '#0f172a'; e.target.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Téléphone</label>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-slate-400" />
                  </div>
                  <input type="tel" placeholder={t('auth.registerTelephone')} required
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none text-sm transition-all placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                    onFocus={(e) => { e.target.style.borderColor = '#0f172a'; e.target.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Ville</label>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-slate-400" />
                    </div>
                    <input type="text" placeholder="Ville de résidence" required
                      className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none text-sm transition-all placeholder:text-slate-400"
                      style={{ color: '#0f172a' }}
                      onFocus={(e) => { e.target.style.borderColor = '#0f172a'; e.target.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)' }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                      onChange={(e) => setFormData({...formData, ville: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Quartier</label>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                      <Home size={16} className="text-slate-400" />
                    </div>
                    <input type="text" placeholder="Quartier" required
                      className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none text-sm transition-all placeholder:text-slate-400"
                      style={{ color: '#0f172a' }}
                      onFocus={(e) => { e.target.style.borderColor = '#0f172a'; e.target.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)' }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                      onChange={(e) => setFormData({...formData, quartier: e.target.value})} />
                  </div>
                </div>
              </div>

              {role === 'PERSONNEL' && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Fonction</label>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                      <GraduationCap size={16} className="text-slate-400" />
                    </div>
                    <select className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none text-sm appearance-none bg-white"
                      style={{ color: '#0f172a' }}
                      onChange={(e) => setFormData({...formData, fonction: e.target.value})}>
                      <option value="ENSEIGNANT">{t('fonction.ENSEIGNANT')}</option>
                      <option value="SURVEILLANT">{t('fonction.SURVEILLANT')}</option>
                      <option value="COMPTABLE">{t('fonction.COMPTABLE')}</option>
                      <option value="DIRECTION">{t('fonction.DIRECTION')}</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Mot de passe</label>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input type="password" placeholder={t('auth.registerPassword')} required
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none text-sm transition-all placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                    onFocus={(e) => { e.target.style.borderColor = '#0f172a'; e.target.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <SubmitBtn loading={submitting} text="Créer un compte" loadingText="Création en cours..." className="w-full btn-admin justify-center py-3" />
            </form>

            {message && (
              <div className={`mt-5 p-3 rounded-lg text-sm ${
                message.includes('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {message}
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft size={14} />
                Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
