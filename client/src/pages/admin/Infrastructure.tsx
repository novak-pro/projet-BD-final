import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Home, Users, MapPin, Edit3, X, Check, Trash2, AlertTriangle, UserCheck } from 'lucide-react';
import api from '../../services/axiosInstance';
import { useTranslation } from '../../i18n/LanguageContext';
import { notifySuccess, notifyError } from '../../utils/notifications';

const statusConfig: Record<string, { color: string; label: string }> = {
  DISPONIBLE: { color: "bg-green-100 text-green-700 border-green-200", label: "Disponible" },
  EN_SERVICE: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "En service" },
  EN_RENOVATION: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "En rénovation" },
  EN_CONSTRUCTION: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "En construction" },
  FERMEE_TEMPORAIREMENT: { color: "bg-red-100 text-red-700 border-red-200", label: "Fermée" },
};

const etats = ['DISPONIBLE', 'EN_SERVICE', 'EN_RENOVATION', 'EN_CONSTRUCTION', 'FERMEE_TEMPORAIREMENT'];

interface Classe {
  idClasse: number;
  libelle: string;
}

interface Titulaire {
  id: number;
  nom: string;
  prenom: string;
}

interface Personnel {
  id: number;
  nom: string;
  prenom: string;
  fonction: string;
}

interface Salle {
  idSalle: number;
  libelle: string;
  position: string | null;
  capacite: number | null;
  etat: string;
  actif: boolean;
  idClasse: number | null;
  classe: Classe | null;
  titulaire: Titulaire | null;
  _count: { eleves: number };
}

const AdminInfrastructure = () => {
  const { t } = useTranslation();
  const [salles, setSalles] = useState<Salle[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [enseignants, setEnseignants] = useState<Personnel[]>([]);
  const [search, setSearch] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSalle, setNewSalle] = useState({ libelle: '', position: '', capacite: '', idClasse: '', enseignantTitulaireId: '' });

  // Edit modal
  const [editingSalle, setEditingSalle] = useState<Salle | null>(null);
  const [editForm, setEditForm] = useState({ libelle: '', position: '', capacite: '', etat: 'DISPONIBLE', idClasse: '', enseignantTitulaireId: '' });

  // Inline position edit
  const [editingPos, setEditingPos] = useState<number | null>(null);
  const [editPosValue, setEditPosValue] = useState('');

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => { fetchSalles(); fetchClasses(); fetchEnseignants(); }, []);

  const fetchSalles = async () => {
    try {
      const res = await api.get('/salles');
      setSalles(res.data);
    } catch { console.error("Erreur chargement salles"); }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/enrollments/classes');
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Erreur chargement classes"); }
  };

  const fetchEnseignants = async () => {
    try {
      const res = await api.get('/personnel');
      setEnseignants(res.data.filter((p: Personnel) => p.fonction === 'ENSEIGNANT'));
    } catch { console.error("Erreur chargement enseignants"); }
  };

  const filtered = salles.filter(s =>
    !search || s.libelle.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/salles', {
        libelle: newSalle.libelle,
        position: newSalle.position || null,
        capacite: parseInt(newSalle.capacite) || 0,
        idClasse: newSalle.idClasse ? parseInt(newSalle.idClasse) : null,
        enseignantTitulaireId: newSalle.enseignantTitulaireId ? parseInt(newSalle.enseignantTitulaireId) : null,
        etat: 'DISPONIBLE',
      });
      setShowCreateModal(false);
      setNewSalle({ libelle: '', position: '', capacite: '', idClasse: '', enseignantTitulaireId: '' });
      fetchSalles();
    } catch { notifyError("Erreur lors de la création"); }
  };

  const openEditModal = (s: Salle) => {
    setEditingSalle(s);
    setEditForm({
      libelle: s.libelle,
      position: s.position || '',
      capacite: s.capacite?.toString() || '',
      etat: s.etat,
      idClasse: s.idClasse?.toString() || '',
      enseignantTitulaireId: s.titulaire?.id?.toString() || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalle) return;
    try {
      await api.put(`/salles/${editingSalle.idSalle}`, {
        libelle: editForm.libelle,
        position: editForm.position || null,
        capacite: parseInt(editForm.capacite) || 0,
        etat: editForm.etat,
        idClasse: editForm.idClasse ? parseInt(editForm.idClasse) : null,
        enseignantTitulaireId: editForm.enseignantTitulaireId ? parseInt(editForm.enseignantTitulaireId) : null,
      });
      setEditingSalle(null);
      fetchSalles();
    } catch { notifyError("Erreur lors de la mise à jour"); }
  };

  const handleUpdateEtat = async (id: number, etat: string) => {
    try {
      await api.patch(`/salles/${id}/etat`, { etat });
      fetchSalles();
    } catch { notifyError("Erreur de mise à jour"); }
  };

  const handleUpdatePosition = async (id: number) => {
    try {
      await api.patch(`/salles/${id}/position`, { position: editPosValue });
      setEditingPos(null);
      fetchSalles();
    } catch { notifyError("Erreur de mise à jour"); }
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    try {
      await api.delete(`/salles/${deletingId}`);
      setDeletingId(null);
      fetchSalles();
    } catch { notifyError("Erreur de suppression"); }
  };

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <Building2 size={18} style={{ color: 'var(--navy)' }} />
            Gestion Infrastructure
          </h2>
          <button onClick={() => setShowCreateModal(true)} className="btn-admin text-sm py-1.5 px-3">
            <Plus size={16} /> Nouvelle Salle
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Home size={20} className="text-indigo-600" /> Salles de classe
            <span className="text-sm font-normal text-gray-400">({salles.length} salle{salles.length > 1 ? 's' : ''})</span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
              <Search size={15} className="text-gray-400" />
            </div>
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-[8px] outline-none text-sm focus:border-[var(--accent)]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((salle) => {
            const nbStudents = salle._count?.eleves ?? 0;
            const capacite = salle.capacite || 0;
            const freeSpaces = capacite - nbStudents;

            return (
              <div key={salle.idSalle} className="bg-white border rounded-[var(--radius-lg)] p-5 shadow-sm hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[salle.etat]?.color}`}>
                    {statusConfig[salle.etat]?.label}
                  </span>
                  <div className="flex gap-1">
                    <select
                      value={salle.etat}
                      onChange={(e) => handleUpdateEtat(salle.idSalle, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none focus:border-[var(--accent)] bg-white"
                    >
                      {etats.map(et => (
                        <option key={et} value={et}>{et.replace(/_/g, ' ').toLowerCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{salle.libelle}</h3>

                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                      <MapPin size={14} />
                      {editingPos === salle.idSalle ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input value={editPosValue} onChange={e => setEditPosValue(e.target.value)}
                            className="flex-1 border border-gray-200 rounded px-2 py-0.5 text-xs outline-none" autoFocus />
                          <button onClick={() => handleUpdatePosition(salle.idSalle)} className="text-green-600 hover:text-green-800"><Check size={14} /></button>
                          <button onClick={() => setEditingPos(null)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                        </div>
                      ) : (
                        <span>{salle.position || 'Aucune position'}</span>
                      )}
                      {editingPos !== salle.idSalle && (
                        <button onClick={() => { setEditingPos(salle.idSalle); setEditPosValue(salle.position || ''); }}
                          className="text-gray-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition ml-1">
                          <Edit3 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEditModal(salle)} className="p-1.5 text-[var(--navy)] hover:bg-[var(--accent-light)] rounded" title="Modifier">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => setDeletingId(salle.idSalle)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-medium text-gray-600">
                  <div className="bg-blue-50 p-2.5 rounded flex items-center gap-2">
                    <Users size={14} className="text-blue-500" />
                    <span><strong className="text-gray-800">{nbStudents}</strong> / {capacite} élèves</span>
                  </div>
                  <div className={`p-2.5 rounded flex items-center gap-2 ${freeSpaces > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span>{freeSpaces > 0 ? 'Libres:' : 'Complet'}</span>
                    {freeSpaces > 0 && <strong className="text-gray-800">{freeSpaces} place{freeSpaces > 1 ? 's' : ''}</strong>}
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded">
                    <span className="text-gray-400">Classe: </span>
                    <span className="text-gray-800">{salle.classe?.libelle || 'Libre'}</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded">
                    <span className="text-gray-400">Titulaire: </span>
                    <span className="text-gray-800">{salle.titulaire ? `${salle.titulaire.nom} ${salle.titulaire.prenom}` : '—'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-400">Aucune salle trouvée.</div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Nouvelle Salle</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="admin-field">
                <label>Libellé *</label>
                <input type="text" placeholder="ex: Salle 101" required value={newSalle.libelle}
                  onChange={e => setNewSalle({ ...newSalle, libelle: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="admin-field">
                  <label>Position</label>
                  <input type="text" placeholder="ex: Bât. A, 1er ét." value={newSalle.position}
                    onChange={e => setNewSalle({ ...newSalle, position: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Capacité *</label>
                  <input type="number" required value={newSalle.capacite}
                    onChange={e => setNewSalle({ ...newSalle, capacite: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="admin-field">
                  <label>Classe rattachée</label>
                  <select value={newSalle.idClasse} onChange={e => setNewSalle({ ...newSalle, idClasse: e.target.value })}>
                    <option value="">Aucune</option>
                    {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Titulaire</label>
                  <select value={newSalle.enseignantTitulaireId} onChange={e => setNewSalle({ ...newSalle, enseignantTitulaireId: e.target.value })}>
                    <option value="">Aucun</option>
                    {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
                <button type="submit" className="flex-1 btn-admin justify-center">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Modifier {editingSalle.libelle}</h2>
              <button onClick={() => setEditingSalle(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="admin-field">
                <label>Libellé *</label>
                <input type="text" required value={editForm.libelle}
                  onChange={e => setEditForm({ ...editForm, libelle: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="admin-field">
                  <label>Position</label>
                  <input type="text" value={editForm.position}
                    onChange={e => setEditForm({ ...editForm, position: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Capacité *</label>
                  <input type="number" required value={editForm.capacite}
                    onChange={e => setEditForm({ ...editForm, capacite: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="admin-field">
                  <label>État</label>
                  <select value={editForm.etat} onChange={e => setEditForm({ ...editForm, etat: e.target.value })}>
                    {etats.map(et => <option key={et} value={et}>{et.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Titulaire</label>
                  <select value={editForm.enseignantTitulaireId} onChange={e => setEditForm({ ...editForm, enseignantTitulaireId: e.target.value })}>
                    <option value="">Aucun</option>
                    {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-field">
                <label>Classe rattachée</label>
                <select value={editForm.idClasse} onChange={e => setEditForm({ ...editForm, idClasse: e.target.value })}>
                  <option value="">Aucune</option>
                  {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingSalle(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
                <button type="submit" className="flex-1 btn-admin justify-center">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Supprimer cette salle ?</h2>
            <p className="text-gray-500 text-sm mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
              <button onClick={handleDelete}
                className="flex-1 btn-admin-danger justify-center py-2.5">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInfrastructure;
