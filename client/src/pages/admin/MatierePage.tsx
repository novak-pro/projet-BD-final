import { useEffect, useState } from 'react';
import { matiereService, epreuveService } from '../../services/apiServices';
import api from '../../services/axiosInstance';
import { BookOpen, Plus, Trash2, FileText, Download, Search, Edit2, X, School } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { notifySuccess, notifyError } from '../../utils/notifications';
import ConfirmModal from '../../components/ConfirmModal';
import SubmitBtn from '../../components/SubmitBtn';
import Spinner from '../../components/Spinner';

interface Matiere {
  id: number;
  nom: string;
  code?: string | null;
  classes: { classe: { idClasse: number; libelle: string; cycle?: { libelle: string } } }[];
  _count?: { livres: number; cours: number };
}

interface EpreuveItem {
  id: number;
  evaluation: string;
  anneeAcad: string;
  auteur: string;
  sujetUrl: string | null;
  corrigeUrl: string | null;
  createdAt: string;
  matiere: { id: number; nom: string };
  classe: { idClasse: number; libelle: string };
}

const backendBase = api.defaults.baseURL?.replace('/api', '') || '';
const fileUrl = (path: string | null) => path?.startsWith('/uploads/') ? `${backendBase}${path}` : path || '';

const MatierePage = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'matieres' | 'epreuves'>('matieres');
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [epreuves, setEpreuves] = useState<EpreuveItem[]>([]);
  const [name, setName] = useState('');
  const [searchMat, setSearchMat] = useState('');
  const [classes, setClasses] = useState<{ idClasse: number; libelle: string }[]>([]);
  const [newClassIds, setNewClassIds] = useState<number[]>([]);

  // Edit modal
  const [editingMat, setEditingMat] = useState<Matiere | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editClassIds, setEditClassIds] = useState<number[]>([]);
  const [confirmState, setConfirmState] = useState<{open:boolean;onConfirm:()=>void;message:string}>({open:false,onConfirm:()=>{},message:''});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMatieres = async () => {
    try {
      const res = await matiereService.getAll();
      setMatieres(res.data);
    } catch { setMatieres([]); }
  };

  const loadEpreuves = async () => {
    const res = await epreuveService.getAll();
    setEpreuves(res.data);
  };

  const loadClasses = async () => {
    try {
      const res = await api.get('/enrollments/classes');
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    await matiereService.create(name, { classIds: newClassIds.length ? newClassIds : undefined });
    setName('');
    setNewClassIds([]);
    loadMatieres();
  };

  const handleDelete = (id: number) => {
    setConfirmState({open:true, onConfirm:async () => {
      await matiereService.delete(id);
      loadMatieres();
      setConfirmState(prev => ({...prev, open: false}));
    }, message:"Supprimer cette matière ?"});
  };

  const openEdit = (m: Matiere) => {
    setEditingMat(m);
    setEditNom(m.nom);
    setEditCode(m.code || '');
    setEditClassIds(m.classes?.map((mc: any) => mc.classe?.idClasse ?? mc.idClasse).filter(Boolean) || []);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMat) return;
    setSubmitting(true);
    try {
      await matiereService.update(editingMat.id, {
        nom: editNom,
        code: editCode || null,
        classIds: editClassIds,
      });
      setEditingMat(null);
      loadMatieres();
    } catch { notifyError("Erreur lors de la modification"); }
    finally { setSubmitting(false); }
  };

  useEffect(() => {
    Promise.all([loadMatieres(), loadClasses()]).finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (tab === 'epreuves') loadEpreuves(); }, [tab]);

  if (loading) return <Spinner text="Chargement des matières..." />;

  const filteredMatieres = matieres.filter(m =>
    m.nom.toLowerCase().includes(searchMat.toLowerCase())
  );

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
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <BookOpen size={18} style={{ color: 'var(--navy)' }} />
            Gestion des Matières & Épreuves
          </h2>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('matieres')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'matieres' ? 'bg-[var(--navy)] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Matières
          </button>
          <button
            onClick={() => setTab('epreuves')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'epreuves' ? 'bg-[var(--navy)] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Épreuves ({epreuves.length})
          </button>
        </div>

        {tab === 'matieres' && (
          <>
            <div className="admin-form mb-10">
              <div className="admin-field">
                <label>Rechercher</label>
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    value={searchMat}
                    onChange={e => setSearchMat(e.target.value)}
                    placeholder="Rechercher une matière..."
                  />
                </div>
              </div>
              <div className="admin-form-row" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                <div className="admin-field">
                  <label>Nouvelle matière</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nom de la matière"
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  />
                </div>
                <div className="admin-field">
                  <label>Classes</label>
                  <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto border border-gray-200 rounded-[var(--radius)] p-2">
                    {classes.length === 0 ? (
                      <span className="text-xs text-gray-400">Aucune classe</span>
                    ) : (
                      classes.map(cl => (
                        <label key={cl.idClasse} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 px-1.5 py-0.5 rounded">
                          <input type="checkbox" checked={newClassIds.includes(cl.idClasse)}
                            onChange={() => setNewClassIds(prev => prev.includes(cl.idClasse) ? prev.filter(id => id !== cl.idClasse) : [...prev, cl.idClasse])}
                            className="rounded border-gray-300" />
                          {cl.libelle}
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="admin-field justify-end">
                  <label>&nbsp;</label>
                  <button onClick={handleAdd} className="btn-admin text-sm py-1.5 px-3">
                    <Plus size={14} /> Ajouter
                  </button>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-8" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMatieres.map(m => (
                <div key={m.id} className="p-3 bg-gray-50 rounded-[var(--radius)] border border-gray-100 flex justify-between items-center group">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{m.nom}</span>
                    {m.code && <span className="text-xs text-gray-400 ml-2">({m.code})</span>}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {m.classes && m.classes.length > 0
                        ? m.classes.map((mc: any) => mc.classe?.libelle).filter(Boolean).join(', ')
                        : <span className="text-gray-300">Toutes les classes</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(m)} className="text-blue-400 hover:text-blue-600">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredMatieres.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">Aucune matière</p>
            )}
          </>
        )}

        {tab === 'epreuves' && (
          <div className="overflow-x-auto">
            {epreuves.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Aucune épreuve déposée par les enseignants.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                    <th className="p-3">Matière</th>
                    <th className="p-3">Classe</th>
                    <th className="p-3">Évaluation</th>
                    <th className="p-3">Année</th>
                    <th className="p-3">Auteur</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-center">Sujet</th>
                    <th className="p-3 text-center">Corrigé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {epreuves.map(ep => (
                    <tr key={ep.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-sm">{ep.matiere.nom}</td>
                      <td className="p-3 text-sm text-gray-600">{ep.classe.libelle}</td>
                      <td className="p-3 text-sm text-gray-700">{ep.evaluation}</td>
                      <td className="p-3 text-sm text-gray-500">{ep.anneeAcad}</td>
                      <td className="p-3 text-sm text-gray-600">{ep.auteur}</td>
                      <td className="p-3 text-sm text-gray-400">{new Date(ep.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="p-3 text-center">
                        {ep.sujetUrl ? (
                          <a href={fileUrl(ep.sujetUrl)} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
                            <Download size={14} /> Voir
                          </a>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="p-3 text-center">
                        {ep.corrigeUrl ? (
                          <a href={fileUrl(ep.corrigeUrl)} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800">
                            <Download size={14} /> Corrigé
                          </a>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Modifier la matière</h2>
              <button onClick={() => setEditingMat(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="admin-field">
                <label>Nom *</label>
                <input type="text" required value={editNom} onChange={e => setEditNom(e.target.value)} />
              </div>
              <div className="admin-field">
                <label>Code</label>
                <input type="text" value={editCode} onChange={e => setEditCode(e.target.value)} placeholder="ex: MATH-01" />
              </div>
              <div className="admin-field">
                <label>Classes</label>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto border border-gray-200 rounded-[var(--radius)] p-2">
                  {classes.length === 0 ? (
                    <span className="text-xs text-gray-400">Aucune classe</span>
                  ) : (
                    classes.map(cl => (
                      <label key={cl.idClasse} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 px-1.5 py-0.5 rounded">
                        <input type="checkbox" checked={editClassIds.includes(cl.idClasse)}
                          onChange={() => setEditClassIds(prev => prev.includes(cl.idClasse) ? prev.filter(id => id !== cl.idClasse) : [...prev, cl.idClasse])}
                          className="rounded border-gray-300" />
                        {cl.libelle}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingMat(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
                <SubmitBtn loading={submitting} text="Enregistrer" className="flex-1" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default MatierePage;
