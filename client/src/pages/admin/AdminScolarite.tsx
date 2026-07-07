import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Edit3, X, Calendar } from 'lucide-react';
import api from '../../services/axiosInstance';
import { notifySuccess, notifyError } from '../../utils/notifications';
import SubmitBtn from '../../components/SubmitBtn';

interface Classe {
  idClasse: number;
  libelle: string;
  cycle: { libelle: string };
}

interface Tranche {
  id: number;
  libelle: string;
  montant: number;
  dateLimite: string;
}

interface Scolarite {
  id: number;
  montantInscription: number;
  montantPension: number;
  nombreTranches: number;
  classeId: number;
  classe: Classe;
  tranches: Tranche[];
}

const AdminScolarite = () => {
  const [scolarites, setScolarites] = useState<Scolarite[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ montantInscription: '', montantPension: '', nombreTranches: '3', classeId: '' });
  const [trancheForm, setTrancheForm] = useState({ libelle: '', montant: '', dateLimite: '', scolariteId: '' });
  const [editingTranche, setEditingTranche] = useState<Tranche | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedScoId, setSelectedScoId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/scolarite').then(r => setScolarites(r.data)).catch(() => {}),
      api.get('/enrollments/classes').then(r => setClasses(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setEditId(null);
    setForm({ montantInscription: '', montantPension: '', nombreTranches: '3', classeId: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/scolarite/${editId}`, form);
        notifySuccess('Scolarité mise à jour');
      } else {
        await api.post('/scolarite', form);
        notifySuccess('Scolarité créée');
      }
      resetForm();
      const res = await api.get('/scolarite');
      setScolarites(res.data);
    } catch (err: any) {
      notifyError(err?.response?.data?.error || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette scolarité ?')) return;
    try {
      await api.delete(`/scolarite/${id}`);
      notifySuccess('Supprimée');
      setScolarites(prev => prev.filter(s => s.id !== id));
    } catch {
      notifyError('Erreur de suppression');
    }
  };

  const openEdit = (s: Scolarite) => {
    setEditId(s.id);
    setForm({
      montantInscription: String(s.montantInscription),
      montantPension: String(s.montantPension),
      nombreTranches: String(s.nombreTranches),
      classeId: String(s.classeId),
    });
  };

  // Tranches
  const handleTrancheSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTranche) {
        await api.put(`/scolarite/tranches/${editingTranche.id}`, trancheForm);
        notifySuccess('Tranche mise à jour');
      } else {
        await api.post('/scolarite/tranches', trancheForm);
        notifySuccess('Tranche créée');
      }
      setEditingTranche(null);
      setTrancheForm({ libelle: '', montant: '', dateLimite: '', scolariteId: '' });
      const res = await api.get('/scolarite');
      setScolarites(res.data);
    } catch {
      notifyError('Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const openTrancheForm = (scolariteId: number, t?: Tranche) => {
    if (t) {
      setEditingTranche(t);
      setTrancheForm({ libelle: t.libelle, montant: String(t.montant), dateLimite: t.dateLimite.split('T')[0], scolariteId: String(scolariteId) });
    } else {
      setEditingTranche(null);
      setTrancheForm({ libelle: '', montant: '', dateLimite: '', scolariteId: String(scolariteId) });
    }
  };

  const handleDeleteTranche = async (id: number) => {
    if (!confirm('Supprimer cette tranche ?')) return;
    try {
      await api.delete(`/scolarite/tranches/${id}`);
      notifySuccess('Tranche supprimée');
      const res = await api.get('/scolarite');
      setScolarites(res.data);
    } catch {
      notifyError('Erreur');
    }
  };

  if (loading) return <div className="admin-card p-10 text-center text-gray-400">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2><FileText size={18} style={{ color: 'var(--navy)' }} /> Gestion des Scolarités</h2>
        </div>

        <form onSubmit={handleSave} className="admin-form mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="admin-form-row">
            <div className="admin-field">
              <label>Classe *</label>
              <select required value={form.classeId} onChange={e => setForm({...form, classeId: e.target.value})} disabled={!!editId}>
                <option value="">Choisir...</option>
                {classes.map(c => (
                  <option key={c.idClasse} value={c.idClasse}>{c.libelle} ({c.cycle?.libelle})</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label>Montant inscription (FCFA)</label>
              <input type="number" required value={form.montantInscription} onChange={e => setForm({...form, montantInscription: e.target.value})} />
            </div>
            <div className="admin-field">
              <label>Montant pension (FCFA)</label>
              <input type="number" required value={form.montantPension} onChange={e => setForm({...form, montantPension: e.target.value})} />
            </div>
            <div className="admin-field">
              <label>Nombre de tranches</label>
              <input type="number" min="1" max="12" required value={form.nombreTranches} onChange={e => setForm({...form, nombreTranches: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <SubmitBtn type="submit" text={editId ? 'Mettre à jour' : 'Créer'} loading={submitting} className="btn-admin" />
            {editId && <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">Annuler</button>}
          </div>
        </form>

        {scolarites.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Aucune scolarité configurée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                  <th className="px-3 py-3">Classe</th>
                  <th className="px-3 py-3">Inscription</th>
                  <th className="px-3 py-3">Pension</th>
                  <th className="px-3 py-3">Tranches</th>
                  <th className="px-3 py-3">Échéancier</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {scolarites.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium">{s.classe.libelle}</td>
                    <td className="px-3 py-3 text-sm">{s.montantInscription.toLocaleString()} FCFA</td>
                    <td className="px-3 py-3 text-sm">{s.montantPension.toLocaleString()} FCFA</td>
                    <td className="px-3 py-3 text-sm">{s.nombreTranches}</td>
                    <td className="px-3 py-3">
                      {selectedScoId === s.id ? (
                        <div className="space-y-2">
                          {s.tranches.map(t => (
                            <div key={t.id} className="flex items-center gap-2 text-xs bg-gray-50 p-1.5 rounded">
                              {editingTranche?.id === t.id ? (
                                <form onSubmit={handleTrancheSave} className="flex items-center gap-1 flex-wrap">
                                  <input type="text" value={trancheForm.libelle} onChange={e => setTrancheForm({...trancheForm, libelle: e.target.value})} className="w-20 px-1 py-0.5 border rounded text-xs" placeholder="Libellé" required />
                                  <input type="number" value={trancheForm.montant} onChange={e => setTrancheForm({...trancheForm, montant: e.target.value})} className="w-20 px-1 py-0.5 border rounded text-xs" placeholder="Montant" required />
                                  <input type="date" value={trancheForm.dateLimite} onChange={e => setTrancheForm({...trancheForm, dateLimite: e.target.value})} className="w-28 px-1 py-0.5 border rounded text-xs" required />
                                  <SubmitBtn type="submit" text="OK" loading={submitting} className="text-xs px-2 py-0.5 btn-admin" />
                                  <button type="button" onClick={() => { setEditingTranche(null); setTrancheForm({ libelle: '', montant: '', dateLimite: '', scolariteId: '' }); }} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
                                </form>
                              ) : (
                                <>
                                  <Calendar size={10} className="text-gray-400" />
                                  <span className="font-medium">{t.libelle}</span>
                                  <span className="text-gray-500">{t.montant.toLocaleString()} FCFA</span>
                                  <span className="text-gray-400">— {new Date(t.dateLimite).toLocaleDateString('fr-FR')}</span>
                                  <button onClick={() => openTrancheForm(s.id, t)} className="text-[var(--navy)] hover:underline ml-1"><Edit3 size={10} /></button>
                                  <button onClick={() => handleDeleteTranche(t.id)} className="text-red-500 hover:text-red-700"><Trash2 size={10} /></button>
                                </>
                              )}
                            </div>
                          ))}
                          {!editingTranche && (
                            <button onClick={() => openTrancheForm(s.id)} className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline">
                              <Plus size={10} /> Ajouter une tranche
                            </button>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => setSelectedScoId(s.id)} className="text-xs text-[var(--accent)] hover:underline">
                          {s.tranches.length} tranche(s) — Voir
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-[var(--navy)] hover:bg-[var(--accent-light)] rounded transition" title="Modifier"><Edit3 size={15} /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition" title="Supprimer"><Trash2 size={15} /></button>
                      </div>
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

export default AdminScolarite;
