import { useState, useEffect } from 'react';
import { UserX, RefreshCw, AlertTriangle, Search } from 'lucide-react';
import api from '../../services/axiosInstance';
import { notifySuccess, notifyError } from '../../utils/notifications';
import ConfirmModal from '../../components/ConfirmModal';

interface DeactivatedUser {
  id: number;
  email: string;
  role: string;
  status: string;
  personnelProfile: { id: number; nom: string; prenom: string } | null;
  parentProfile: { id: number; nom: string; prenom: string } | null;
}

export default function AdminDeactivatedAccounts() {
  const [users, setUsers] = useState<DeactivatedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reactivating, setReactivating] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/deactivated');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReactivate = async (userId: number) => {
    setReactivating(userId);
    try {
      await api.post('/users/reactivate', { userId });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch { notifyError("Erreur lors de la réactivation"); }
    setReactivating(null);
  };

  const getDisplayName = (u: DeactivatedUser) => {
    if (u.personnelProfile) return `${u.personnelProfile.prenom} ${u.personnelProfile.nom}`;
    if (u.parentProfile) return `${u.parentProfile.prenom} ${u.parentProfile.nom}`;
    return u.email;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN_PRINCIPAL: 'Admin',
      PERSONNEL: 'Personnel',
      PARENT: 'Parent',
    };
    return labels[role] || role;
  };

  const filtered = users.filter(u =>
    getDisplayName(u).toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <UserX size={18} style={{ color: 'var(--navy)' }} />
          Comptes désactivés
        </h2>
        <span className="admin-badge bg-red-100 text-red-700">{users.length} compte{users.length > 1 ? 's' : ''}</span>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Ces comptes ont été désactivés et ne peuvent plus accéder à la plateforme.
      </p>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
          <Search size={15} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm focus:border-[var(--navy)]"
        />
        <button onClick={load} className="p-2 rounded-lg hover:bg-gray-100 transition" title="Rafraîchir">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <UserX size={40} className="mx-auto mb-3 text-gray-200" />
          <p>{search ? 'Aucun résultat' : 'Aucun compte désactivé'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                <th className="px-3 py-3">Nom</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Rôle</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-gray-800">{getDisplayName(u)}</td>
                  <td className="px-3 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-3 py-3">
                    <span className="admin-badge bg-gray-100 text-gray-600 text-[10px]">{getRoleLabel(u.role)}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => handleReactivate(u.id)}
                      disabled={reactivating === u.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <AlertTriangle size={12} />
                      {reactivating === u.id ? 'Réactivation...' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
