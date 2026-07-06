import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X, Search, Eye, Download } from 'lucide-react';
import api from '../../services/axiosInstance';
import { notifySuccess, notifyError } from '../../utils/notifications';
import ConfirmModal from '../../components/ConfirmModal';

interface Payment {
  id: number;
  montant: number;
  nombreTranches: number;
  methode: string;
  modePaiement: string | null;
  recuPDF: string | null;
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
  const [viewRecu, setViewRecu] = useState<{ id: number; url: string; name: string } | null>(null);

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
      notifyError("Erreur lors de la validation");
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
                  <th className="px-3 py-3">Mode</th>
                  <th className="px-3 py-3">Reçu</th>
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
                    <td className="px-3 py-3 text-sm text-gray-500">
                      {p.modePaiement === 'CASH' ? 'Cash école' : p.modePaiement === 'VIREMENT' ? 'Virement' : p.methode.replace('_', ' ')}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {p.recuPDF ? (
                        <button
                          onClick={() => setViewRecu({ id: p.id, url: p.recuPDF!, name: `recu-${p.eleve.prenom}-${p.eleve.nom}-${p.id}` })}
                          className="flex items-center gap-1 text-[var(--navy)] hover:underline text-xs font-medium"
                        >
                          <Eye size={14} /> Voir
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
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

      {/* Modal visualisation du reçu */}
      {viewRecu && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewRecu(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold">Reçu de paiement</h3>
              <div className="flex items-center gap-2">
                <a
                  href={viewRecu.url}
                  download={viewRecu.name}
                  className="flex items-center gap-1 text-xs bg-[var(--navy)] text-white px-3 py-1.5 rounded-lg hover:brightness-110 transition-all"
                >
                  <Download size={14} /> Télécharger
                </a>
                <button onClick={() => setViewRecu(null)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {viewRecu.url.startsWith('data:image') ? (
                <img src={viewRecu.url} alt="Reçu" className="w-full rounded-lg" />
              ) : (
                <iframe src={viewRecu.url} className="w-full h-[60vh] rounded-lg" title="Reçu PDF" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
