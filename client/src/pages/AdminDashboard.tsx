import { useEffect, useState } from 'react';
import { Check, X, UserCheck, Users, Building2, GraduationCap, Clock, ShieldAlert } from 'lucide-react';

// Composant pour les cartes de stats (Style Image 3)
const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-3xl font-bold text-gray-700">{value}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">{title}</p>
    </div>
    <div className="text-gray-200">
      <Icon size={48} strokeWidth={1.5} />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/admin/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPendingUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur fetch pending:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const processUser = async (userId: number, action: 'ACTIVE' | 'DISABLED') => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:3000/api/admin/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, action })
    });
    fetchPending();
  };

  return (
    <div className="space-y-8">
      
      {/* ── GRILLE DE STATISTIQUES (Style Image 3) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Élèves" value="1,036" icon={Users} />
        <StatCard title="Enseignants" value="92" icon={GraduationCap} />
        <StatCard title="Salles de classe" value="58" icon={Building2} />
        <StatCard title="Demandes en attente" value={pendingUsers.length} icon={Clock} />
      </div>

      {/* ── SECTION PRINCIPALE : DEMANDES D'ACCÈS ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        
        {/* En-tête du tableau style "Masantren" */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
            <ShieldAlert size={18} className="text-amber-500" />
            Demandes d'accès au portail
          </h2>
          <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold">
            {pendingUsers.length} À TRAITER
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-400 animate-pulse text-sm">Chargement des données...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b">
                  <th className="px-6 py-4 italic">Utilisateur</th>
                  <th className="px-6 py-4">Rôle demandé</th>
                  <th className="px-6 py-4">Contact / Email</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck size={40} className="text-gray-200" />
                        <p>Aucune demande d'inscription en attente.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs shadow-sm">
                            {(user.personnelProfile?.nom?.[0] || user.parentProfile?.nom?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-700">
                              {user.personnelProfile?.nom || user.parentProfile?.nom}{' '}
                              {user.personnelProfile?.prenom || user.parentProfile?.prenom}
                            </div>
                            <div className="text-[11px] text-gray-400 lowercase italic">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase
                          ${user.role === 'PERSONNEL'
                            ? 'bg-purple-50 text-purple-600 border border-purple-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 font-medium">
                          {user.personnelProfile?.telephone || user.parentProfile?.telephone || 'Non renseigné'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => processUser(user.id, 'ACTIVE')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded text-[10px] font-bold hover:bg-green-600 shadow-sm transition-all active:scale-95"
                          >
                            <Check size={14} /> ACCEPTER
                          </button>
                          <button
                            onClick={() => processUser(user.id, 'DISABLED')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded text-[10px] font-bold hover:bg-red-600 shadow-sm transition-all active:scale-95"
                          >
                            <X size={14} /> REFUSER
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer du tableau */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 italic">
          Affichage des demandes d'accès directes. Veuillez vérifier l'identité avant validation.
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;