import { useEffect, useState } from 'react';
import { Check, X, UserCheck, Users, Building2, GraduationCap, Clock, ShieldAlert } from 'lucide-react';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="admin-stat-card">
    <div className="admin-stat-icon" style={{ background: `${color}15`, color }}>
      <Icon size={20} />
    </div>
    <div>
      <strong>{value}</strong>
      <span>{title}</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEleves: 0, totalEnseignants: 0, totalSalles: 0, pendingUsers: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending')
      ]);
      setStats(statsRes.data);
      setPendingUsers(Array.isArray(pendingRes.data) ? pendingRes.data : []);
    } catch (err) {
      console.error("Erreur fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const processUser = async (userId: number, action: 'ACTIVE' | 'DISABLED') => {
    try {
      await api.post('/admin/validate', { userId, action });
    } catch (err) {
      console.error("Erreur process user:", err);
    }
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="admin-stats-overview">
        <StatCard title={t('student.list')} value={stats.totalEleves.toLocaleString()} icon={Users} color="#1B2A4A" />
        <StatCard title={t('nav.personnel')} value={stats.totalEnseignants.toLocaleString()} icon={GraduationCap} color="#4A7DC9" />
        <StatCard title={t('nav.infrastructure')} value={stats.totalSalles.toLocaleString()} icon={Building2} color="#2C4A7C" />
        <StatCard title={t('auth.register')} value={stats.pendingUsers} icon={Clock} color="#dc2626" />
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <ShieldAlert size={18} style={{ color: 'var(--navy)' }} />
            Demandes d'accès au portail
          </h2>
          <span className="admin-badge" style={{ background: 'var(--navy)', color: '#fff' }}>
            {pendingUsers.length} {pendingUsers.length > 1 ? 'A TRAITER' : 'A TRAITER'}
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse text-sm">{t('common.loading')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck size={40} className="text-gray-200" />
                        <p>Aucune demande d'inscription en attente.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm" style={{ background: 'var(--navy)' }}>
                            {(user.personnelProfile?.nom?.[0] || user.parentProfile?.nom?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-700">
                              {user.personnelProfile?.nom || user.parentProfile?.nom}{' '}
                              {user.personnelProfile?.prenom || user.parentProfile?.prenom}
                            </div>
                            <div className="text-[11px] text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="admin-badge" style={{ background: user.role === 'PERSONNEL' ? '#f3e8ff' : '#e8edf5', color: user.role === 'PERSONNEL' ? '#9333ea' : 'var(--navy)' }}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {user.personnelProfile?.telephone || user.parentProfile?.telephone || 'Non renseigné'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => processUser(user.id, 'ACTIVE')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-[10px] font-bold hover:bg-green-700 transition-all"
                          >
                            <Check size={12} /> ACCEPTER
                          </button>
                          <button
                            onClick={() => processUser(user.id, 'DISABLED')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 transition-all"
                          >
                            <X size={12} /> REFUSER
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
