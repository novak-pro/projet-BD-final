import React, { useState, useEffect } from 'react';
import { ShieldAlert, Send, AlertTriangle, Search, History, Scale, Trash2, Check, X, Edit3, Save } from 'lucide-react';
import api from '../../services/axiosInstance';
import { useTranslation } from '../../i18n/LanguageContext';
import { notifySuccess, notifyError } from '../../utils/notifications';
import ConfirmModal from '../../components/ConfirmModal';
import SubmitBtn from '../../components/SubmitBtn';
import Spinner from '../../components/Spinner';

interface Incident {
  id: number;
  type: string;
  date: string;
  gravite: string;
  pointsDeduits: number;
  commentaire: string;
  auteur: string;
  eleveId: number;
  status: string;
  eleve?: { matricule: number; nom: string; prenom: string; classeId: number | null };
}

interface Eleve {
  matricule: number;
  nom: string;
  prenom: string;
  soldePoints: number;
}

interface TypeInfra {
  id: number;
  libelle: string;
  gravite: string;
  pointsMalus: number;
}

const DisciplinePage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'rapport' | 'pending' | 'alertes' | 'types'>('pending');

  // Rapport tab
  const [form, setForm] = useState({ eleveId: '', type: '', gravite: 'Faible', points: 2, commentaire: '' });
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Historique
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [viewingHistory, setViewingHistory] = useState(false);

  // Types d'infractions tab
  const [types, setTypes] = useState<TypeInfra[]>([]);
  const [typeForm, setTypeForm] = useState({ libelle: '', gravite: 'Faible', pointsMalus: 2 });
  const [editingType, setEditingType] = useState<number | null>(null);
  const [showTypeForm, setShowTypeForm] = useState(false);

  // Pending tab
  const [pendingIncidents, setPendingIncidents] = useState<Incident[]>([]);
  const [editingPending, setEditingPending] = useState<number | null>(null);
  const [editPendingForm, setEditPendingForm] = useState({ commentaire: '', pointsDeduits: 0, gravite: '' });
  const [confirmState, setConfirmState] = useState<{open:boolean;onConfirm:()=>void;message:string}>({open:false,onConfirm:()=>{},message:''});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadEleves(), loadPending(), loadTypes()]).finally(() => setLoading(false));
    const interval = setInterval(loadPending, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadTypes = async () => {
    try {
      const res = await api.get('/discipline/types');
      setTypes(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ }
  };

  const loadEleves = async () => {
    try {
      const res = await api.get('/students');
      setEleves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement élèves", err);
    }
  };

  const loadPending = async () => {
    try {
      const res = await api.get('/discipline/incident/pending');
      setPendingIncidents(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Erreur chargement signalements"); }
  };

  const viewHistory = async (eleve: Eleve) => {
    try {
      const res = await api.get(`/discipline/eleve/${eleve.matricule}`);
      setIncidents(res.data.incidents || []);
      setSelectedEleve(eleve);
      setViewingHistory(true);
    } catch (err) {
      notifyError("Erreur de récupération de l'historique");
    }
  };

  const handleDeleteIncident = (id: number, eleve: Eleve) => {
    setConfirmState({open:true, onConfirm:async () => {
      try {
        await api.delete(`/discipline/incident/${id}`);
        viewHistory(eleve);
        loadEleves();
      } catch { notifyError("Erreur lors de la suppression"); }
      setConfirmState(prev => ({...prev, open: false}));
    }, message:"Supprimer cet incident ? Les points seront restitués."});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/discipline/incident', {
        eleveId: parseInt(form.eleveId),
        type: form.type,
        gravite: form.gravite,
        pointsDeduits: form.points,
        commentaire: form.commentaire,
        auteur: 'Administrateur'
      });
      notifySuccess("Incident enregistré !");
      setForm({ eleveId: '', type: '', gravite: 'Faible', points: 2, commentaire: '' });
      loadEleves();
    } catch (err) {
      notifyError("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditPending = (inc: Incident) => {
    setEditingPending(inc.id);
    setEditPendingForm({ commentaire: inc.commentaire, pointsDeduits: inc.pointsDeduits, gravite: inc.gravite });
  };

  const handleApprovePending = async (id: number) => {
    try {
      await api.put(`/discipline/incident/${id}`, { status: 'APPROVED' });
      setEditingPending(null);
      loadPending();
      loadEleves();
    } catch { notifyError("Erreur lors de l'approbation"); }
  };

  const handleRejectPending = async (id: number) => {
    try {
      await api.put(`/discipline/incident/${id}`, { status: 'REJECTED' });
      setEditingPending(null);
      loadPending();
    } catch { notifyError("Erreur"); }
  };

  const handleSaveEditPending = async (id: number) => {
    try {
      await api.put(`/discipline/incident/${id}`, {
        commentaire: editPendingForm.commentaire,
        pointsDeduits: editPendingForm.pointsDeduits,
        gravite: editPendingForm.gravite,
      });
      setEditingPending(null);
      loadPending();
    } catch { notifyError("Erreur de sauvegarde"); }
  };

  // ---- CRUD Types d'infractions ----
  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/discipline/types', typeForm);
      notifySuccess("Type d'infraction créé !");
      setTypeForm({ libelle: '', gravite: 'Faible', pointsMalus: 2 });
      setShowTypeForm(false);
      loadTypes();
    } catch { notifyError("Erreur lors de la création"); }
    finally { setSubmitting(false); }
  };

  const handleUpdateType = async (id: number) => {
    try {
      await api.put(`/discipline/types/${id}`, typeForm);
      setEditingType(null);
      setTypeForm({ libelle: '', gravite: 'Faible', pointsMalus: 2 });
      loadTypes();
    } catch { notifyError("Erreur lors de la mise à jour"); }
  };

  const handleDeleteType = async (id: number) => {
    setConfirmState({open:true, onConfirm:async () => {
      try {
        await api.delete(`/discipline/types/${id}`);
        loadTypes();
      } catch { notifyError("Erreur lors de la suppression"); }
      setConfirmState(prev => ({...prev, open: false}));
    }, message:"Supprimer ce type d'infraction ?"});
  };

  const openEditType = (t: TypeInfra) => {
    setEditingType(t.id);
    setTypeForm({ libelle: t.libelle, gravite: t.gravite, pointsMalus: t.pointsMalus });
  };

  const filteredEleves = eleves.filter(e =>
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const elevesAlert = eleves.filter(e => (e.soldePoints ?? 20) <= 10);

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <ConfirmModal
        open={confirmState.open}
        title="Confirmation"
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({...prev, open: false}))}
        variant="danger"
        confirmLabel="Oui"
        cancelLabel="Non"
      />
    {loading ? <Spinner text="Chargement de la discipline..." /> : (
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <Scale size={18} style={{ color: 'var(--navy)' }} />
            Gestion Disciplinaire
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button onClick={() => { setActiveTab('rapport'); setViewingHistory(false); }}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${activeTab === 'rapport' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <Send size={14} className="inline mr-1" /> Rapport
          </button>
          <button onClick={() => setActiveTab('pending')}
            className={`pb-3 text-sm font-semibold transition border-b-2 relative ${activeTab === 'pending' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <ShieldAlert size={14} className="inline mr-1" /> Signalements
            {pendingIncidents.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingIncidents.length}</span>
            )}
          </button>
          <button onClick={() => { setActiveTab('alertes'); setViewingHistory(false); }}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${activeTab === 'alertes' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <AlertTriangle size={14} className="inline mr-1" /> Alertes
          </button>
          <button onClick={() => { setActiveTab('types'); setViewingHistory(false); }}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${activeTab === 'types' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <Scale size={14} className="inline mr-1" /> Types d'infractions
          </button>
        </div>

        {/* Tab: Rapport */}
        {activeTab === 'rapport' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Send className="text-red-600"/> Rapport Disciplinaire</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Élève concerné</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                        <Search size={15} className="text-gray-400" />
                      </div>
                      <input className="flex-1 px-3 py-2 border border-gray-200 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" placeholder="Rechercher un élève..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="w-full border border-gray-200 p-2 mt-2 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" value={form.eleveId} onChange={e => setForm({...form, eleveId: e.target.value})} required>
                      <option value="">Sélectionner...</option>
                      {filteredEleves.map(e => (
                        <option key={e.matricule} value={e.matricule}>{e.nom} {e.prenom}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Type d'incident</label>
                    <select className="w-full border border-gray-200 p-2 mt-1 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="">Choisir...</option>
                      {types.map(t => (
                        <option key={t.id} value={t.libelle}>{t.libelle}</option>
                      ))}
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Gravité</label>
                      <select className="w-full border border-gray-200 p-2 mt-1 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" value={form.gravite} onChange={e => setForm({...form, gravite: e.target.value})}>
                        <option>Faible</option>
                        <option>Moyenne</option>
                        <option>Haute</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Points à retirer</label>
                      <input type="number" className="w-full border border-gray-200 p-2 mt-1 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" value={form.points} onChange={e => setForm({...form, points: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                  <textarea className="w-full border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" placeholder="Commentaire détaillé..." rows={4} value={form.commentaire} onChange={e => setForm({...form, commentaire: e.target.value})} required></textarea>
                  <SubmitBtn loading={submitting} text="Enregistrer" className="w-full" />
                </form>
              </div>
            </div>
            <div className="lg:col-span-2">
              {viewingHistory && selectedEleve ? (
                <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <History size={20} className="text-indigo-600"/>
                      Historique - {selectedEleve.nom} {selectedEleve.prenom}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold text-lg ${(selectedEleve.soldePoints ?? 20) < 10 ? 'text-red-600' : 'text-green-600'}`}>
                        Solde: {selectedEleve.soldePoints ?? 20}/20
                      </span>
                      <button onClick={() => setViewingHistory(false)} className="text-sm text-gray-500 hover:text-gray-700">Fermer</button>
                    </div>
                  </div>
                  {incidents.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucun incident enregistré pour cet élève.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {incidents.map(inc => (
                        <div key={inc.id} className="border border-gray-100 rounded-[var(--radius)] p-4 flex justify-between items-start hover:bg-gray-50 group">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-red-600">-{inc.pointsDeduits} pts</span>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{inc.type}</span>
                              <span className={`text-xs px-2 py-1 rounded ${inc.gravite === 'Haute' ? 'bg-red-100 text-red-700' : inc.gravite === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>{inc.gravite}</span>
                              {inc.status === 'PENDING' && <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">En attente</span>}
                            </div>
                            <p className="text-sm mt-2 text-gray-600 italic">"{inc.commentaire}"</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(inc.date)} — {inc.auteur}</p>
                          </div>
                          <button onClick={() => handleDeleteIncident(inc.id, selectedEleve)}
                            className="opacity-0 group-hover:opacity-100 transition p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-[var(--radius-lg)] text-center">
                  <p className="text-blue-700 font-semibold">Sélectionnez un élève dans le formulaire pour voir son historique</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Signalements enseignants */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert size={20} className="text-orange-500" />
              Signalements des enseignants ({pendingIncidents.length})
            </h3>
            {pendingIncidents.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun signalement en attente.</p>
            ) : (
              pendingIncidents.map(inc => (
                <div key={inc.id} className="bg-white border border-orange-200 rounded-[var(--radius-lg)] p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-bold text-gray-800">{inc.eleve?.nom} {inc.eleve?.prenom}</span>
                      <span className="text-gray-400 text-sm ml-2">(Matricule: {inc.eleve?.matricule})</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{inc.status}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{inc.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${inc.gravite === 'Haute' ? 'bg-red-100 text-red-700' : inc.gravite === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>{inc.gravite}</span>
                        <span className="text-xs text-gray-400">{formatDate(inc.date)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Signalé par: {inc.auteur}</p>
                    </div>
                    <div className="flex gap-2">
                      {editingPending === inc.id ? (
                        <>
                          <button onClick={() => handleSaveEditPending(inc.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Sauvegarder">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingPending(null)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded" title="Annuler">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => openEditPending(inc)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Modifier">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleApprovePending(inc.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approuver">
                            <Check size={16} />
                          </button>
                          <button onClick={() => handleRejectPending(inc.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Rejeter">
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Points à déduire</label>
                    {editingPending === inc.id ? (
                      <input type="number" className="w-full border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]"
                        value={editPendingForm.pointsDeduits} onChange={e => setEditPendingForm({ ...editPendingForm, pointsDeduits: parseInt(e.target.value) || 0 })} />
                    ) : (
                      <p className="font-bold text-red-600">-{inc.pointsDeduits} pts</p>
                    )}
                  </div>
                  <div className="space-y-1 mt-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Gravité</label>
                    {editingPending === inc.id ? (
                      <select className="w-full border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]"
                        value={editPendingForm.gravite} onChange={e => setEditPendingForm({ ...editPendingForm, gravite: e.target.value })}>
                        <option>Faible</option>
                        <option>Moyenne</option>
                        <option>Haute</option>
                      </select>
                    ) : (
                      <p className="text-sm">{inc.gravite}</p>
                    )}
                  </div>
                  <div className="space-y-1 mt-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Commentaire</label>
                    {editingPending === inc.id ? (
                      <textarea className="w-full border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" rows={3}
                        value={editPendingForm.commentaire} onChange={e => setEditPendingForm({ ...editPendingForm, commentaire: e.target.value })} />
                    ) : (
                      <p className="text-sm text-gray-600 italic">"{inc.commentaire}"</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Types d'infractions */}
        {activeTab === 'types' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Scale size={20} className="text-indigo-600" />
                Catalogue des infractions
              </h3>
              <button onClick={() => { setShowTypeForm(!showTypeForm); setEditingType(null); setTypeForm({ libelle: '', gravite: 'Faible', pointsMalus: 2 }); }}
                className="btn-admin text-sm py-1.5 px-3">
                {showTypeForm ? 'Annuler' : 'Nouvelle infraction'}
              </button>
            </div>

            {showTypeForm && (
              <form onSubmit={handleCreateType} className="bg-white border border-gray-200 rounded-[var(--radius-lg)] p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="admin-field">
                  <label>Libellé</label>
                  <input type="text" required value={typeForm.libelle}
                    onChange={e => setTypeForm({ ...typeForm, libelle: e.target.value })}
                    placeholder="ex: Retard, Insulte..." />
                </div>
                <div className="admin-field">
                  <label>Gravité</label>
                  <select value={typeForm.gravite} onChange={e => setTypeForm({ ...typeForm, gravite: e.target.value })}>
                    <option>Faible</option>
                    <option>Moyenne</option>
                    <option>Grave</option>
                    <option>Très Grave</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Points malus</label>
                  <input type="number" required value={typeForm.pointsMalus}
                    onChange={e => setTypeForm({ ...typeForm, pointsMalus: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-end">
                  <SubmitBtn loading={submitting} text="Ajouter" className="w-full" />
                </div>
              </form>
            )}

            {types.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun type d'infraction défini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                      <th className="px-3 py-3">Libellé</th>
                      <th className="px-3 py-3">Gravité</th>
                      <th className="px-3 py-3">Points malus</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {types.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        {editingType === t.id ? (
                          <>
                            <td className="px-3 py-3">
                              <input type="text" className="border border-gray-200 p-1 rounded text-sm w-full"
                                value={typeForm.libelle} onChange={e => setTypeForm({ ...typeForm, libelle: e.target.value })} />
                            </td>
                            <td className="px-3 py-3">
                              <select className="border border-gray-200 p-1 rounded text-sm w-full"
                                value={typeForm.gravite} onChange={e => setTypeForm({ ...typeForm, gravite: e.target.value })}>
                                <option>Faible</option>
                                <option>Moyenne</option>
                                <option>Grave</option>
                                <option>Très Grave</option>
                              </select>
                            </td>
                            <td className="px-3 py-3">
                              <input type="number" className="border border-gray-200 p-1 rounded text-sm w-20"
                                value={typeForm.pointsMalus} onChange={e => setTypeForm({ ...typeForm, pointsMalus: parseInt(e.target.value) || 0 })} />
                            </td>
                            <td className="px-3 py-3 text-right">
                              <button onClick={() => handleUpdateType(t.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Sauvegarder"><Save size={15} /></button>
                              <button onClick={() => setEditingType(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded" title="Annuler"><X size={15} /></button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-3 text-sm font-medium text-gray-800">{t.libelle}</td>
                            <td className="px-3 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                t.gravite === 'Très Grave' ? 'bg-red-200 text-red-800' :
                                t.gravite === 'Grave' ? 'bg-red-100 text-red-700' :
                                t.gravite === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {t.gravite}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm font-bold text-red-600">-{t.pointsMalus} pts</td>
                            <td className="px-3 py-3 text-right">
                              <button onClick={() => openEditType(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Modifier"><Edit3 size={15} /></button>
                              <button onClick={() => handleDeleteType(t.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Supprimer"><Trash2 size={15} /></button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Alertes */}
        {activeTab === 'alertes' && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-[var(--radius-lg)]">
            <h3 className="text-red-700 font-bold flex items-center gap-2 mb-4"><AlertTriangle size={20}/> Alertes - Seuils Critiques</h3>
            {elevesAlert.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun élève en dessous du seuil critique.</p>
            ) : (
              elevesAlert.map(e => (
                <div key={e.matricule} className="bg-white p-4 rounded-[var(--radius)] border border-red-100 flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                      {e.nom?.[0]}{e.prenom?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 uppercase">{e.nom} {e.prenom}</p>
                      <p className="text-xs text-red-500 font-bold">Solde actuel: {e.soldePoints ?? 20} / 20</p>
                    </div>
                  </div>
                  <button onClick={() => viewHistory(e)} className="text-sm bg-white border border-gray-200 px-3 py-1 rounded-[var(--radius)] hover:bg-gray-50">
                    Historique
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
    )}
    </>
  );
};

export default DisciplinePage;
