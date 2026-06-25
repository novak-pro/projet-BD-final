import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, ChevronDown, ChevronRight, Check, X, Edit3, Award } from 'lucide-react';
import api from '../../services/axiosInstance';
import { useTranslation } from '../../i18n/LanguageContext';

interface Session {
  idSession: number;
  libelle: string;
}

interface Trimestre {
  idTrimestre: number;
  libelle: string;
  sessions: Session[];
}

interface Annee {
  idAcademi: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  active: boolean;
  trimestres: Trimestre[];
}

const AdminAcademique = () => {
  const { t } = useTranslation();
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Modals
  const [showAnneeModal, setShowAnneeModal] = useState(false);
  const [editAnnee, setEditAnnee] = useState<Annee | null>(null);
  const [anneeForm, setAnneeForm] = useState({ libelle: '', dateDebut: '', dateFin: '' });

  const [newTrimestre, setNewTrimestre] = useState({ idAcademi: 0, libelle: '' });
  const [newSession, setNewSession] = useState({ idTrimestre: 0, libelle: '' });

  useEffect(() => { fetchAnnees(); }, []);

  const fetchAnnees = async () => {
    try {
      const res = await api.get('/academique/annees');
      setAnnees(res.data);
    } catch { console.error('Erreur'); }
    finally { setLoading(false); }
  };

  const openCreateAnnee = () => {
    setEditAnnee(null);
    setAnneeForm({ libelle: '', dateDebut: '', dateFin: '' });
    setShowAnneeModal(true);
  };

  const openEditAnnee = (a: Annee) => {
    setEditAnnee(a);
    setAnneeForm({
      libelle: a.libelle,
      dateDebut: a.dateDebut ? a.dateDebut.substring(0, 10) : '',
      dateFin: a.dateFin ? a.dateFin.substring(0, 10) : '',
    });
    setShowAnneeModal(true);
  };

  const handleSaveAnnee = async () => {
    try {
      if (editAnnee) {
        await api.put(`/academique/annees/${editAnnee.idAcademi}`, anneeForm);
      } else {
        await api.post('/academique/annees', anneeForm);
      }
      setShowAnneeModal(false);
      fetchAnnees();
    } catch { alert("Erreur"); }
  };

  const handleDeleteAnnee = async (id: number) => {
    if (!window.confirm("Supprimer cette année académique ? Tous les trimestres et sessions seront supprimés.")) return;
    try {
      await api.delete(`/academique/annees/${id}`);
      fetchAnnees();
    } catch { alert("Suppression impossible"); }
  };

  const handleSetActive = async (id: number) => {
    try {
      await api.patch(`/academique/annees/${id}/active`);
      fetchAnnees();
    } catch { alert("Erreur"); }
  };

  const handleAddTrimestre = async () => {
    if (!newTrimestre.libelle) return;
    try {
      await api.post('/academique/trimestres', newTrimestre);
      setNewTrimestre({ idAcademi: 0, libelle: '' });
      fetchAnnees();
    } catch { alert("Erreur"); }
  };

  const handleDeleteTrimestre = async (id: number) => {
    if (!window.confirm("Supprimer ce trimestre ?")) return;
    try {
      await api.delete(`/academique/trimestres/${id}`);
      fetchAnnees();
    } catch { alert("Erreur"); }
  };

  const handleAddSession = async () => {
    if (!newSession.libelle) return;
    try {
      await api.post('/academique/sessions', newSession);
      setNewSession({ idTrimestre: 0, libelle: '' });
      fetchAnnees();
    } catch { alert("Erreur"); }
  };

  const handleDeleteSession = async (id: number) => {
    if (!window.confirm("Supprimer cette session ?")) return;
    try {
      await api.delete(`/academique/sessions/${id}`);
      fetchAnnees();
    } catch { alert("Erreur"); }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement...</div>;

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
                          {new Date(annee.dateDebut).toLocaleDateString('fr-FR')} → {new Date(annee.dateFin).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {annee.active && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {!annee.active && (
                        <button onClick={() => handleSetActive(annee.idAcademi)}
                          className="p-1.5 text-gray-400 hover:text-green-600 transition" title="Définir comme active">
                          <Check size={15} />
                        </button>
                      )}
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

                  {/* Trimestres + Sessions */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
                      {/* Ajouter un trimestre */}
                      <div className="flex items-center gap-2">
                        <input
                          value={newTrimestre.idAcademi === annee.idAcademi ? newTrimestre.libelle : ''}
                          onChange={e => setNewTrimestre({ idAcademi: annee.idAcademi, libelle: e.target.value })}
                          onFocus={() => setNewTrimestre(prev => ({ ...prev, idAcademi: annee.idAcademi }))}
                          placeholder="Nouveau trimestre (ex: Trimestre 1)"
                          className="flex-1 border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm"
                        />
                        <button onClick={handleAddTrimestre}
                          className="btn-admin text-sm py-1.5 px-3 whitespace-nowrap">
                          <Plus size={14} /> Ajouter
                        </button>
                      </div>

                      {annee.trimestres.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-2">Aucun trimestre pour cette année.</p>
                      ) : (
                        annee.trimestres.map((tri) => (
                          <div key={tri.idTrimestre} className="bg-white border border-gray-200 rounded-[var(--radius)] p-3">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                                <Award size={14} className="text-[var(--navy)]" />
                                {tri.libelle}
                              </span>
                              <button onClick={() => handleDeleteTrimestre(tri.idTrimestre)}
                                className="text-gray-300 hover:text-red-500 transition">
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Sessions */}
                            <div className="ml-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  value={newSession.idTrimestre === tri.idTrimestre ? newSession.libelle : ''}
                                  onChange={e => setNewSession({ idTrimestre: tri.idTrimestre, libelle: e.target.value })}
                                  onFocus={() => setNewSession(prev => ({ ...prev, idTrimestre: tri.idTrimestre }))}
                                  placeholder="Nouvelle session (ex: Session 1 - Devoirs)"
                                  className="flex-1 border border-gray-200 p-1.5 rounded-[var(--radius)] outline-none text-xs"
                                />
                                <button onClick={handleAddSession}
                                  className="text-xs bg-[var(--navy)] text-white px-2 py-1.5 rounded hover:brightness-110 transition whitespace-nowrap">
                                  + Session
                                </button>
                              </div>

                              {tri.sessions.length === 0 ? (
                                <p className="text-xs text-gray-300 ml-2">Aucune session.</p>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {tri.sessions.map((ses) => (
                                    <div key={ses.idSession}
                                      className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded px-2 py-1 text-xs text-blue-700">
                                      <span>{ses.libelle}</span>
                                      <button onClick={() => handleDeleteSession(ses.idSession)}
                                        className="text-blue-300 hover:text-red-500 ml-0.5">
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Année */}
      {showAnneeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editAnnee ? "Modifier l'année" : "Nouvelle année académique"}
            </h2>
            <div className="admin-form">
              <div className="admin-field">
                <label>Libellé (ex: 2024-2025)</label>
                <input value={anneeForm.libelle} onChange={e => setAnneeForm({...anneeForm, libelle: e.target.value})} required />
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Date début</label>
                  <input type="date" value={anneeForm.dateDebut} onChange={e => setAnneeForm({...anneeForm, dateDebut: e.target.value})} required />
                </div>
                <div className="admin-field">
                  <label>Date fin</label>
                  <input type="date" value={anneeForm.dateFin} onChange={e => setAnneeForm({...anneeForm, dateFin: e.target.value})} required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAnneeModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded font-semibold hover:bg-gray-200 transition">
                  Annuler
                </button>
                <button onClick={handleSaveAnnee}
                  className="flex-1 btn-admin justify-center">
                  {editAnnee ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademique;
