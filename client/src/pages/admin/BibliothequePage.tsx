import React, { useState, useEffect } from 'react';
import { Book, Plus, Edit, Trash2, Search, X, BookOpen } from 'lucide-react';
import api from '../../services/axiosInstance';
import { notifySuccess, notifyError } from '../../utils/notifications';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/Spinner';

interface Livre {
  id: number;
  titre: string;
  auteur: string;
  maisonEdition: string | null;
  description: string | null;
  cycle: string;
  classeConcernee: string;
  langue: string;
  couvertureUrl: string | null;
  pdfUrl: string | null;
  idMatiere: number;
  matiere: { id: number; nom: string };
}

interface Matiere {
  id: number;
  nom: string;
}

interface Cycle {
  idCycle: number;
  libelle: string;
}

interface Classe {
  idClasse: number;
  libelle: string;
  cycle: { idCycle: number; libelle: string };
}

const initialForm = { titre: '', auteur: '', maisonEdition: '', description: '', cycle: '', classeConcernee: '', langue: 'Francais', idMatiere: '' };

const BibliothequePage = () => {
  const [livres, setLivres] = useState<Livre[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [search, setSearch] = useState('');
  const [filterCycle, setFilterCycle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Livre | null>(null);
  const [form, setForm] = useState(initialForm);
  const [couvertureFile, setCouvertureFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [couvertureName, setCouvertureName] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [confirmState, setConfirmState] = useState<{open:boolean;onConfirm:()=>void;message:string}>({open:false,onConfirm:()=>{},message:''});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lRes, mRes, cRes, clsRes] = await Promise.all([
        api.get('/bibliotheque'),
        api.get('/matieres'),
        api.get('/enrollments/cycles'),
        api.get('/enrollments/classes'),
      ]);
      setLivres(Array.isArray(lRes.data) ? lRes.data : []);
      setMatieres(Array.isArray(mRes.data) ? mRes.data : []);
      setCycles(Array.isArray(cRes.data) ? cRes.data : []);
      setClasses(Array.isArray(clsRes.data) ? clsRes.data : []);
    } catch (err) {
      console.error("Erreur chargement", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setCouvertureFile(null);
    setPdfFile(null);
    setCouvertureName('');
    setPdfName('');
    setShowModal(true);
  };

  const openEdit = (livre: Livre) => {
    setEditing(livre);
    setForm({
      titre: livre.titre,
      auteur: livre.auteur,
      maisonEdition: livre.maisonEdition || '',
      description: livre.description || '',
      cycle: livre.cycle,
      classeConcernee: livre.classeConcernee,
      langue: livre.langue,
      idMatiere: String(livre.idMatiere)
    });
    setCouvertureFile(null);
    setPdfFile(null);
    setCouvertureName(livre.couvertureUrl ? livre.couvertureUrl.split('/').pop() || '' : '');
    setPdfName(livre.pdfUrl ? livre.pdfUrl.split('/').pop() || '' : '');
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setConfirmState({open:true, onConfirm:async () => {
      try {
        await api.delete(`/bibliotheque/${id}`);
        loadData();
      } catch (err) {
        notifyError("Erreur lors de la suppression");
      }
      setConfirmState(prev => ({...prev, open: false}));
    }, message:"Supprimer ce livre ?"});
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append('titre', form.titre);
    fd.append('auteur', form.auteur);
    fd.append('maisonEdition', form.maisonEdition);
    fd.append('description', form.description);
    fd.append('cycle', form.cycle);
    fd.append('classeConcernee', form.classeConcernee);
    fd.append('langue', form.langue);
    fd.append('idMatiere', form.idMatiere);
    if (couvertureFile) fd.append('couverture', couvertureFile);
    if (pdfFile) fd.append('fichier', pdfFile);
    try {
      if (editing) {
        await api.put(`/bibliotheque/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/bibliotheque', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false);
      notifySuccess(editing ? "Livre modifié avec succès" : "Livre ajouté avec succès");
      loadData();
    } catch (err) {
      notifyError("Erreur lors de l'enregistrement");
    }
  };

  const cycleOptions = cycles.map(c => c.libelle);
  const filteredClasses = form.cycle ? classes.filter(c => c.cycle?.libelle === form.cycle) : classes;

  const filtered = livres.filter(l => {
    if (search && !`${l.titre} ${l.auteur}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCycle && l.cycle !== filterCycle) return false;
    return true;
  });

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
    {loading ? <Spinner text="Chargement de la bibliothèque..." /> : (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <Book size={18} style={{ color: 'var(--navy)' }} />
          Bibliothèque
        </h2>
        <button onClick={openCreate} className="btn-admin text-sm py-1.5 px-3">
          <Plus size={16}/> Ajouter un livre
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
            <Search size={15} className="text-gray-400" />
          </div>
          <input className="flex-1 px-3 py-2 border border-gray-200 rounded-[8px] outline-none text-sm focus:border-[var(--accent)]" placeholder="Rechercher par titre ou auteur..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="border border-gray-200 rounded-[8px] py-2 px-3 text-sm outline-none" value={filterCycle} onChange={e => setFilterCycle(e.target.value)}>
          <option value="">Tous les cycles</option>
          {cycleOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(livre => (
          <div key={livre.id} className="bg-white rounded-[var(--radius-lg)] border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
              {livre.couvertureUrl ? (
                <img src={`${api.defaults.baseURL?.replace('/api', '')}${livre.couvertureUrl}`} alt={livre.titre} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={48} style={{ color: 'var(--navy)', opacity: 0.3 }} />
              )}
            </div>
            <div className="p-3">
              <h3 className="font-bold text-gray-800 truncate">{livre.titre}</h3>
              <p className="text-sm text-gray-500">{livre.auteur}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="admin-badge" style={{ background: 'var(--accent-light)', color: 'var(--navy)' }}>{livre.matiere?.nom}</span>
                <span className="admin-badge bg-gray-100 text-gray-600">{livre.cycle}</span>
                <span className="admin-badge bg-gray-100 text-gray-600">{livre.classeConcernee}</span>
              </div>
              {livre.description && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{livre.description}</p>}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                {livre.pdfUrl && <a href={`${api.defaults.baseURL?.replace('/api', '')}${livre.pdfUrl}`} target="_blank" rel="noreferrer" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Voir PDF</a>}
                <div className="flex gap-2 ml-auto">
                  <button onClick={() => openEdit(livre)} className="p-1.5 hover:bg-gray-100 rounded"><Edit size={15} className="text-gray-500"/></button>
                  <button onClick={() => handleDelete(livre.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 size={15} className="text-red-400"/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Book size={48} className="mx-auto mb-3" style={{ color: 'var(--gray-light)' }}/>
            <p>Aucun livre trouvé</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-[var(--radius-lg)] shadow-xl w-full max-w-lg m-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editing ? "Modifier le livre" : "Ajouter un livre"}</h2>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400"/></button>
            </div>
            <div className="admin-form">
              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Titre</label>
                  <input value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} required />
                </div>
                <div className="admin-field">
                  <label>Auteur</label>
                  <input value={form.auteur} onChange={e => setForm({...form, auteur: e.target.value})} required />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Cycle</label>
                  <select value={form.cycle} onChange={e => { setForm({...form, cycle: e.target.value, classeConcernee: '' }); }}>
                    <option value="">Sélectionner...</option>
                    {cycles.map(c => <option key={c.idCycle} value={c.libelle}>{c.libelle}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Classe concernée</label>
                  <select value={form.classeConcernee} onChange={e => setForm({...form, classeConcernee: e.target.value})} required>
                    <option value="">Sélectionner...</option>
                    {filteredClasses.map(cl => <option key={cl.idClasse} value={cl.libelle}>{cl.libelle}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Langue</label>
                  <select value={form.langue} onChange={e => setForm({...form, langue: e.target.value})}>
                    <option value="Francais">Francais</option>
                    <option value="Anglais">Anglais</option>
                    <option value="Bilingue">Bilingue</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Matière</label>
                  <select value={form.idMatiere} onChange={e => setForm({...form, idMatiere: e.target.value})} required>
                    <option value="">Choisir...</option>
                    {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-field">
                <label>Maison d'édition</label>
                <input value={form.maisonEdition} onChange={e => setForm({...form, maisonEdition: e.target.value})} />
              </div>
              <div className="admin-field">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Couverture</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border border-dashed border-gray-300 rounded-[var(--radius)]">
                    <span className="text-xs text-gray-400 flex-1 truncate">{couvertureName || 'Aucun fichier'}</span>
                    <label className="text-xs bg-[var(--navy)] text-white px-2 py-1 rounded cursor-pointer hover:brightness-110">
                      Parcourir
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setCouvertureFile(f); setCouvertureName(f.name); } }} />
                    </label>
                  </div>
                </div>
                <div className="admin-field">
                  <label>Fichier PDF</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border border-dashed border-gray-300 rounded-[var(--radius)]">
                    <span className="text-xs text-gray-400 flex-1 truncate">{pdfName || 'Aucun fichier'}</span>
                    <label className="text-xs bg-[var(--navy)] text-white px-2 py-1 rounded cursor-pointer hover:brightness-110">
                      Parcourir
                      <input type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setPdfFile(f); setPdfName(f.name); } }} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-[var(--radius)] text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                <button onClick={handleSubmit} className="btn-admin">
                  {editing ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    )}
    </>
  );
};

export default BibliothequePage;
