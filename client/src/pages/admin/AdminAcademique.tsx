import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, ChevronDown, ChevronRight, Check, X, Edit3, Award, Copy, Wand2, Users, Building2, Save } from 'lucide-react';
import api from '../../services/axiosInstance';
import { useTranslation } from '../../i18n/LanguageContext';
import { notifySuccess, notifyError } from '../../utils/notifications';
import ConfirmModal from '../../components/ConfirmModal';
import SubmitBtn from '../../components/SubmitBtn';

interface Session {
  idSession: number;
  libelle: string;
  dateDebut: string | null;
  dateFin: string | null;
}

interface Trimestre {
  idTrimestre: number;
  libelle: string;
  dateDebut: string | null;
  dateFin: string | null;
  sessions: Session[];
}

interface Annee {
  idAcademi: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  active: boolean;
  statut: 'PREVUE' | 'EN_COURS' | 'TERMINEE';
  trimestres: Trimestre[];
  elevesCount: number;
  classesCount: number;
}

type TriStatus = 'PREVU' | 'EN_COURS' | 'TERMINE' | null;

const getTriStatus = (d: string | null | undefined, f: string | null | undefined): TriStatus => {
  if (!d || !f) return null;
  const now = new Date();
  const debut = new Date(d);
  const fin = new Date(f);
  if (now < debut) return 'PREVU';
  if (now > fin) return 'TERMINE';
  return 'EN_COURS';
};

const formatDate = (d: string | null | undefined): string => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toInput = (d: string | null | undefined): string => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().substring(0, 10);
};

const AdminAcademique = () => {
  const { t } = useTranslation();
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Modals
  const [showAnneeModal, setShowAnneeModal] = useState(false);
  const [editAnnee, setEditAnnee] = useState<Annee | null>(null);
  const [duplicateSourceId, setDuplicateSourceId] = useState<number | null>(null);
  const [anneeForm, setAnneeForm] = useState({ libelle: '', dateDebut: '', dateFin: '' });

  // Inline editing for trimestres & sessions
  const [editingTri, setEditingTri] = useState<{ id: number; libelle: string; dateDebut: string; dateFin: string } | null>(null);
  const [editingSes, setEditingSes] = useState<{ id: number; libelle: string; dateDebut: string; dateFin: string } | null>(null);

  // Add forms
  const [newTrimestre, setNewTrimestre] = useState({ idAcademi: 0, libelle: '', dateDebut: '', dateFin: '' });
  const [newSession, setNewSession] = useState({ idTrimestre: 0, libelle: '', dateDebut: '', dateFin: '' });
  const [confirmState, setConfirmState] = useState<{ open: boolean; onConfirm: () => void; message: string }>({ open: false, onConfirm: () => {}, message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAnnees(); }, []);

  const fetchAnnees = async () => {
    try {
      const res = await api.get('/academique/annees');
      setAnnees(res.data);
    } catch { console.error('Erreur'); }
    finally { setLoading(false); }
  };

  const openCreateAnnee = () => {
    setEditAnnee(null); setDuplicateSourceId(null);
    setAnneeForm({ libelle: '', dateDebut: '', dateFin: '' });
    setShowAnneeModal(true);
  };

  const toDateInputValue = (d: string) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().substring(0, 10);
  };

  const openEditAnnee = (a: Annee) => {
    setEditAnnee(a); setDuplicateSourceId(null);
    setAnneeForm({ libelle: a.libelle, dateDebut: toDateInputValue(a.dateDebut), dateFin: toDateInputValue(a.dateFin) });
    setShowAnneeModal(true);
  };

  const openDuplicateAnnee = (a: Annee) => {
    setEditAnnee(null); setDuplicateSourceId(a.idAcademi);
    setAnneeForm({ libelle: `Copie - ${a.libelle}`, dateDebut: toDateInputValue(a.dateDebut), dateFin: toDateInputValue(a.dateFin) });
    setShowAnneeModal(true);
  };

  const handleSaveAnnee = async () => {
    setSubmitting(true);
    try {
      if (duplicateSourceId) {
        await api.post(`/academique/annees/${duplicateSourceId}/duplicate`, anneeForm);
        notifySuccess('Année dupliquée avec succès');
      } else if (editAnnee) {
        await api.put(`/academique/annees/${editAnnee.idAcademi}`, anneeForm);
        notifySuccess('Année mise à jour');
      } else {
        await api.post('/academique/annees', anneeForm);
        notifySuccess('Année créée avec succès');
      }
      setShowAnneeModal(false);
      fetchAnnees();
    } catch (err: any) {
      notifyError(err?.response?.data?.error || "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnee = (id: number) => {
    setConfirmState({
      open: true,
      onConfirm: async () => {
        try { await api.delete(`/academique/annees/${id}`); fetchAnnees(); notifySuccess('Année supprimée'); }
        catch (err: any) { notifyError(err?.response?.data?.error || "Suppression impossible"); }
      },
      message: "Supprimer cette année académique ? Tous les trimestres et sessions seront supprimés."
    });
  };

  const handleSetActive = async (id: number) => {
    try {
      await api.patch(`/academique/annees/${id}/active`);
      notifySuccess('Année active changée');
      fetchAnnees();
    } catch { notifyError("Erreur"); }
  };

  const handleSetStatut = async (id: number, statut: string) => {
    try {
      await api.put(`/academique/annees/${id}`, { statut });
      notifySuccess('Statut mis à jour');
      fetchAnnees();
    } catch { notifyError("Erreur"); }
  };

  const handleGenerateTrimestres = async (idAcademi: number) => {
    try {
      await api.post(`/academique/annees/${idAcademi}/trimestres/generate`);
      notifySuccess('3 trimestres créés avec leurs sessions');
      fetchAnnees();
    } catch (err: any) {
      notifyError(err?.response?.data?.error || "Erreur de génération");
    }
  };

  const handleAddTrimestre = async () => {
    if (!newTrimestre.libelle) return;
    try {
      await api.post('/academique/trimestres', newTrimestre);
      setNewTrimestre({ idAcademi: 0, libelle: '', dateDebut: '', dateFin: '' });
      fetchAnnees();
    } catch { notifyError("Erreur"); }
  };

  const handleUpdateTrimestre = async () => {
    if (!editingTri) return;
    try {
      await api.put(`/academique/trimestres/${editingTri.id}`, editingTri);
      setEditingTri(null);
      notifySuccess('Trimestre mis à jour');
      fetchAnnees();
    } catch { notifyError("Erreur"); }
  };

  const handleDeleteTrimestre = (id: number) => {
    setConfirmState({
      open: true,
      onConfirm: async () => {
        try { await api.delete(`/academique/trimestres/${id}`); fetchAnnees(); }
        catch { notifyError("Erreur"); }
      },
      message: "Supprimer ce trimestre ?"
    });
  };

  const handleAddSession = async () => {
    if (!newSession.libelle) return;
    try {
      await api.post('/academique/sessions', newSession);
      setNewSession({ idTrimestre: 0, libelle: '', dateDebut: '', dateFin: '' });
      fetchAnnees();
    } catch { notifyError("Erreur"); }
  };

  const handleUpdateSession = async () => {
    if (!editingSes) return;
    try {
      await api.put(`/academique/sessions/${editingSes.id}`, editingSes);
      setEditingSes(null);
      notifySuccess('Session mise à jour');
      fetchAnnees();
    } catch { notifyError("Erreur"); }
  };

  const handleDeleteSession = (id: number) => {
    setConfirmState({
      open: true,
      onConfirm: async () => {
        try { await api.delete(`/academique/sessions/${id}`); fetchAnnees(); }
        catch { notifyError("Erreur"); }
      },
      message: "Supprimer cette session ?"
    });
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement...</div>;

  const statutColors: Record<string, string> = {
    PREVUE: 'bg-blue-100 text-blue-700 border-blue-200',
    EN_COURS: 'bg-green-100 text-green-700 border-green-200',
    TERMINEE: 'bg-gray-100 text-gray-500 border-gray-200',
    PREVU: 'bg-blue-100 text-blue-700 border-blue-200',
    TERMINE: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  const statutLabels: Record<string, string> = {
    PREVUE: 'Prévue', EN_COURS: 'En cours', TERMINEE: 'Terminée',
    PREVU: 'Prévu', TERMINE: 'Terminé',
  };

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <Calendar size={18} style={{ color: 'var(--navy)' }} />
            Gestion des Années Académiques
          </h2>
          <button onClick={openCreateAnnee} className="btn-admin text-sm">
            <Plus size={16} /> Nouvelle année
          </button>
        </div>

        {annees.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Aucune année académique créée.</div>
        ) : (
          <div className="space-y-3">
            {annees.map((annee) => {
              const isExpanded = expanded === annee.idAcademi;
              const yearStart = new Date(annee.dateDebut).getTime();
              const yearEnd = new Date(annee.dateFin).getTime();
              const yearDur = yearEnd - yearStart;
              const showTimeline = yearDur > 0 && annee.trimestres.some(t => t.dateDebut && t.dateFin);

              return (
                <div key={annee.idAcademi} className="border border-gray-200 rounded-[var(--radius-lg)] overflow-hidden">
                  {/* Header année */}
                  <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : annee.idAcademi)}>
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                      <div>
                        <span className="font-bold text-gray-800">{annee.libelle}</span>
                        <span className="text-sm text-gray-500 ml-3">
                          {toDateInputValue(annee.dateDebut).split('-').reverse().join('/')} → {toDateInputValue(annee.dateFin).split('-').reverse().join('/')}
                        </span>
                      </div>
                      {annee.active && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          Active
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statutColors[annee.statut] || ''}`}>
                        {statutLabels[annee.statut] || annee.statut}
                      </span>
                      <div className="flex items-center gap-3 ml-2">
                        <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          <Users size={12} /> {annee.elevesCount} élève{annee.elevesCount !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          <Building2 size={12} /> {annee.classesCount} classe{annee.classesCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {!annee.active && (
                        <button onClick={() => handleSetActive(annee.idAcademi)}
                          className="p-1.5 text-gray-400 hover:text-green-600 transition" title="Définir comme active">
                          <Check size={15} />
                        </button>
                      )}
                      <select value={annee.statut} onChange={e => handleSetStatut(annee.idAcademi, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-1.5 py-1 outline-none cursor-pointer"
                        onClick={e => e.stopPropagation()} title="Changer le statut">
                        <option value="PREVUE">Prévue</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="TERMINEE">Terminée</option>
                      </select>
                      <button onClick={() => openDuplicateAnnee(annee)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 transition" title="Dupliquer">
                        <Copy size={15} />
                      </button>
                      <button onClick={() => openEditAnnee(annee)}
                        className="p-1.5 text-gray-400 hover:text-[var(--navy)] transition" title="Modifier">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => handleDeleteAnnee(annee.idAcademi)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition" title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Timeline + Trimestres + Sessions */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
                      {/* Frise chronologique */}
                      {showTimeline && (
                        <div className="relative h-10 bg-gray-100/60 rounded-full overflow-hidden">
                          {annee.trimestres.filter(t => t.dateDebut && t.dateFin).map(tri => {
                            const tStart = new Date(tri.dateDebut!).getTime();
                            const tEnd = new Date(tri.dateFin!).getTime();
                            const left = Math.max(0, ((tStart - yearStart) / yearDur) * 100);
                            const width = Math.min(100 - left, ((tEnd - tStart) / yearDur) * 100);
                            const st = getTriStatus(tri.dateDebut, tri.dateFin);
                            const bg = st === 'EN_COURS' ? 'bg-green-400' : st === 'PREVU' ? 'bg-blue-400' : 'bg-gray-300';
                            return (
                              <div key={tri.idTrimestre}
                                className={`absolute top-1 bottom-1 rounded-full ${bg} opacity-70 flex items-center justify-center text-xs text-white font-medium overflow-hidden`}
                                style={{ left: `${left}%`, width: `${width}%` }}
                                title={`${tri.libelle}: ${formatDate(tri.dateDebut)} → ${formatDate(tri.dateFin)}`}>
                                {width > 12 ? tri.libelle.replace('Trimestre ', 'T') : ''}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Génération automatique */}
                      {annee.trimestres.length === 0 && (
                        <button onClick={() => handleGenerateTrimestres(annee.idAcademi)}
                          className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-3 py-2 hover:bg-indigo-100 transition w-full justify-center">
                          <Wand2 size={16} />
                          Ajouter les 3 trimestres automatiquement
                        </button>
                      )}

                      {/* Ajouter un trimestre */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <input value={newTrimestre.idAcademi === annee.idAcademi ? newTrimestre.libelle : ''}
                          onChange={e => setNewTrimestre({ ...newTrimestre, idAcademi: annee.idAcademi, libelle: e.target.value })}
                          onFocus={() => setNewTrimestre(prev => ({ ...prev, idAcademi: annee.idAcademi }))}
                          placeholder="Nouveau trimestre (ex: Trimestre 1)"
                          className="flex-1 min-w-[140px] border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm" />
                        <input type="date" value={newTrimestre.idAcademi === annee.idAcademi ? newTrimestre.dateDebut : ''}
                          onChange={e => setNewTrimestre({ ...newTrimestre, idAcademi: annee.idAcademi, dateDebut: e.target.value })}
                          onFocus={() => setNewTrimestre(prev => ({ ...prev, idAcademi: annee.idAcademi }))}
                          className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm" />
                        <input type="date" value={newTrimestre.idAcademi === annee.idAcademi ? newTrimestre.dateFin : ''}
                          onChange={e => setNewTrimestre({ ...newTrimestre, idAcademi: annee.idAcademi, dateFin: e.target.value })}
                          onFocus={() => setNewTrimestre(prev => ({ ...prev, idAcademi: annee.idAcademi }))}
                          className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm" />
                        <button onClick={handleAddTrimestre}
                          className="btn-admin text-sm py-1.5 px-3 whitespace-nowrap">
                          <Plus size={14} /> Ajouter
                        </button>
                      </div>

                      {annee.trimestres.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-2">Aucun trimestre pour cette année.</p>
                      ) : (
                        annee.trimestres.map((tri) => {
                          const triStatus = getTriStatus(tri.dateDebut, tri.dateFin);
                          const isEditing = editingTri?.id === tri.idTrimestre;
                          return (
                            <div key={tri.idTrimestre} className="bg-white border border-gray-200 rounded-[var(--radius)] p-3">
                              {/* Trimestre header */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <Award size={14} className="text-[var(--navy)] shrink-0" />
                                  {isEditing ? (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <input value={editingTri!.libelle} onChange={e => setEditingTri({ ...editingTri!, libelle: e.target.value })}
                                        className="border border-gray-200 p-1 rounded text-sm w-36" />
                                      <input type="date" value={editingTri!.dateDebut} onChange={e => setEditingTri({ ...editingTri!, dateDebut: e.target.value })}
                                        className="border border-gray-200 p-1 rounded text-sm" />
                                      <input type="date" value={editingTri!.dateFin} onChange={e => setEditingTri({ ...editingTri!, dateFin: e.target.value })}
                                        className="border border-gray-200 p-1 rounded text-sm" />
                                      <button onClick={handleUpdateTrimestre}
                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition">
                                        <Save size={13} />
                                      </button>
                                      <button onClick={() => setEditingTri(null)}
                                        className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300 transition">
                                        <X size={13} />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="font-semibold text-gray-700 text-sm">{tri.libelle}</span>
                                      {(tri.dateDebut || tri.dateFin) && (
                                        <span className="text-xs text-gray-400">
                                          {formatDate(tri.dateDebut)} → {formatDate(tri.dateFin)}
                                        </span>
                                      )}
                                      {triStatus && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statutColors[triStatus] || ''}`}>
                                          {statutLabels[triStatus] || triStatus}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  <button onClick={() => setEditingTri({ id: tri.idTrimestre, libelle: tri.libelle, dateDebut: toInput(tri.dateDebut), dateFin: toInput(tri.dateFin) })}
                                    className="text-gray-300 hover:text-[var(--navy)] transition" title="Modifier">
                                    <Edit3 size={13} />
                                  </button>
                                  <button onClick={() => handleDeleteTrimestre(tri.idTrimestre)}
                                    className="text-gray-300 hover:text-red-500 transition" title="Supprimer">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* Sessions */}
                              <div className="ml-4 space-y-2 mt-3">
                                {/* Ajouter une session */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <input value={newSession.idTrimestre === tri.idTrimestre ? newSession.libelle : ''}
                                    onChange={e => setNewSession({ ...newSession, idTrimestre: tri.idTrimestre, libelle: e.target.value })}
                                    onFocus={() => setNewSession(prev => ({ ...prev, idTrimestre: tri.idTrimestre }))}
                                    placeholder="Nouvelle session"
                                    className="flex-1 min-w-[120px] border border-gray-200 p-1.5 rounded-[var(--radius)] outline-none text-xs" />
                                  <input type="date" value={newSession.idTrimestre === tri.idTrimestre ? newSession.dateDebut : ''}
                                    onChange={e => setNewSession({ ...newSession, idTrimestre: tri.idTrimestre, dateDebut: e.target.value })}
                                    onFocus={() => setNewSession(prev => ({ ...prev, idTrimestre: tri.idTrimestre }))}
                                    className="border border-gray-200 p-1.5 rounded-[var(--radius)] outline-none text-xs" />
                                  <input type="date" value={newSession.idTrimestre === tri.idTrimestre ? newSession.dateFin : ''}
                                    onChange={e => setNewSession({ ...newSession, idTrimestre: tri.idTrimestre, dateFin: e.target.value })}
                                    onFocus={() => setNewSession(prev => ({ ...prev, idTrimestre: tri.idTrimestre }))}
                                    className="border border-gray-200 p-1.5 rounded-[var(--radius)] outline-none text-xs" />
                                  <button onClick={handleAddSession}
                                    className="text-xs bg-[var(--navy)] text-white px-2 py-1.5 rounded hover:brightness-110 transition whitespace-nowrap">
                                    + Session
                                  </button>
                                </div>

                                {/* Liste des sessions */}
                                {tri.sessions.length === 0 ? (
                                  <p className="text-xs text-gray-300 ml-2">Aucune session.</p>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5">
                                    {tri.sessions.map((ses) => {
                                      const isEditingSes = editingSes?.id === ses.idSession;
                                      return (
                                        <div key={ses.idSession}
                                          className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded px-2 py-1 text-xs text-blue-700">
                                          {isEditingSes ? (
                                            <div className="flex items-center gap-1">
                                              <input value={editingSes!.libelle} onChange={e => setEditingSes({ ...editingSes!, libelle: e.target.value })}
                                                className="border border-blue-100 p-0.5 rounded text-xs w-20" />
                                              <input type="date" value={editingSes!.dateDebut} onChange={e => setEditingSes({ ...editingSes!, dateDebut: e.target.value })}
                                                className="border border-blue-100 p-0.5 rounded text-xs w-28" />
                                              <input type="date" value={editingSes!.dateFin} onChange={e => setEditingSes({ ...editingSes!, dateFin: e.target.value })}
                                                className="border border-blue-100 p-0.5 rounded text-xs w-28" />
                                              <button onClick={handleUpdateSession} className="text-green-600 hover:text-green-800"><Save size={11} /></button>
                                              <button onClick={() => setEditingSes(null)} className="text-gray-400 hover:text-gray-600"><X size={11} /></button>
                                            </div>
                                          ) : (
                                            <>
                                              <span>{ses.libelle}</span>
                                              {(ses.dateDebut || ses.dateFin) && (
                                                <span className="text-blue-400 ml-0.5">
                                                  ({formatDate(ses.dateDebut)}{ses.dateFin && ses.dateFin !== ses.dateDebut ? ` - ${formatDate(ses.dateFin)}` : ''})
                                                </span>
                                              )}
                                              <button onClick={() => setEditingSes({ id: ses.idSession, libelle: ses.libelle, dateDebut: toInput(ses.dateDebut), dateFin: toInput(ses.dateFin) })}
                                                className="text-blue-300 hover:text-[var(--navy)] ml-0.5"><Edit3 size={10} /></button>
                                              <button onClick={() => handleDeleteSession(ses.idSession)}
                                                className="text-blue-300 hover:text-red-500 ml-0.5"><X size={11} /></button>
                                            </>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal open={confirmState.open} title="Confirmation" message={confirmState.message} variant="danger"
        onConfirm={() => { confirmState.onConfirm(); setConfirmState(prev => ({ ...prev, open: false })); }}
        onCancel={() => setConfirmState(prev => ({ ...prev, open: false }))} />

      {/* Modal Année */}
      {showAnneeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {duplicateSourceId ? "Dupliquer l'année" : editAnnee ? "Modifier l'année" : "Nouvelle année académique"}
            </h2>
            <div className="admin-form">
              <div className="admin-field">
                <label>Libellé (ex: 2024-2025)</label>
                <input value={anneeForm.libelle} onChange={e => setAnneeForm({ ...anneeForm, libelle: e.target.value })} required />
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Date début</label>
                  <input type="date" value={anneeForm.dateDebut} onChange={e => setAnneeForm({ ...anneeForm, dateDebut: e.target.value })} required />
                </div>
                <div className="admin-field">
                  <label>Date fin</label>
                  <input type="date" value={anneeForm.dateFin} onChange={e => setAnneeForm({ ...anneeForm, dateFin: e.target.value })} required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAnneeModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded font-semibold hover:bg-gray-200 transition">
                  Annuler
                </button>
                <SubmitBtn loading={submitting} text={duplicateSourceId ? "Dupliquer" : editAnnee ? "Enregistrer" : "Créer"} className="flex-1" onClick={handleSaveAnnee} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademique;
