import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X, Search } from 'lucide-react';
import api from '../../services/axiosInstance';

interface Payment {
  id: number;
  montant: number;
  nombreTranches: number;
  methode: string;
  transactionRef: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  createdAt: string;
  adminNotes: string | null;
  eleve: { nom: string; prenom: string; niveau: string };
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await api.get('/payments/all');
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (id: number, status: 'VALIDATED' | 'REJECTED') => {
    try {
      await api.patch(`/payments/${id}/validate`, { status });
      loadPayments();
    } catch (err) {
      alert("Erreur lors de la validation");
    }
  };

  const filtered = payments.filter(p => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return `${p.eleve.prenom} ${p.eleve.nom}`.toLowerCase().includes(q) || p.transactionRef.toLowerCase().includes(q);
  });

  const stats = {
    total: payments.reduce((s, p) => s + p.montant, 0),
    valide: payments.filter(p => p.status === 'VALIDATED').reduce((s, p) => s + p.montant, 0),
    enAttente: payments.filter(p => p.status === 'PENDING').length,
  };

  return (
    <div className="space-y-6">
      <div className="admin-stats-overview">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#1B2A4A15', color: '#1B2A4A' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <strong>{stats.total.toLocaleString()} FCFA</strong>
            <span>Total encaissé</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#16a34a15', color: '#16a34a' }}>
            <Check size={20} />
          </div>
          <div>
            <strong>{stats.valide.toLocaleString()} FCFA</strong>
            <span>Validé</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#d9770615', color: '#d97706' }}>
            <X size={20} />
          </div>
          <div>
            <strong>{stats.enAttente}</strong>
            <span>En attente</span>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <CreditCard size={18} style={{ color: 'var(--navy)' }} />
            Gestion des Paiements
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
              <Search size={15} className="text-gray-400" />
            </div>
            <input type="text" placeholder="Rechercher par élève ou référence..." value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-[8px] outline-none text-sm w-64 focus:border-[var(--accent)]" />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucun paiement trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                  <th className="px-3 py-3">Élève</th>
                  <th className="px-3 py-3">Montant</th>
                  <th className="px-3 py-3">Méthode</th>
                  <th className="px-3 py-3">Référence</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Statut</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm">{p.eleve.prenom} {p.eleve.nom}</td>
                    <td className="px-3 py-3 text-sm font-bold">{p.montant.toLocaleString()} FCFA</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{p.methode.replace('_', ' ')}</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{p.transactionRef}</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-3 py-3">
                      <span className={`admin-badge ${
                        p.status === 'VALIDATED' ? 'bg-green-100 text-green-700' :
                        p.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {p.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleValidation(p.id, 'VALIDATED')}
                            className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700">
                            <Check size={14}/> Valider
                          </button>
                          <button onClick={() => handleValidation(p.id, 'REJECTED')}
                            className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700">
                            <X size={14}/> Refuser
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
