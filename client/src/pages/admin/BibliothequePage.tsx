import React, { useState, useEffect } from 'react';
import { Book, Plus, Edit, Trash2, Search, X, BookOpen } from 'lucide-react';
import api from '../../services/axiosInstance';

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

const initialForm = { titre: '', auteur: '', maisonEdition: '', description: '', cycle: 'Premier cycle', classeConcernee: '', langue: 'Francais', couvertureUrl: '', pdfUrl: '', idMatiere: '' };

const cycles = ['Premier cycle', 'Deuxieme cycle', 'Troisieme cycle'];

const BibliothequePage = () => {
  const [livres, setLivres] = useState<Livre[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [search, setSearch] = useState('');
  const [filterCycle, setFilterCycle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Livre | null>(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [lRes, mRes] = await Promise.all([
        api.get('/bibliotheque'),
        api.get('/matieres')
      ]);
      setLivres(Array.isArray(lRes.data) ? lRes.data : []);
      setMatieres(Array.isArray(mRes.data) ? mRes.data : []);
    } catch (err) {
      console.error("Erreur chargement", err);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
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
      couvertureUrl: livre.couvertureUrl || '',
      pdfUrl: livre.pdfUrl || '',
      idMatiere: String(livre.idMatiere)
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce livre ?")) return;
    try {
      await api.delete(`/bibliotheque/${id}`);
      loadData();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleSubmit = async () => {
    const payload = { ...form, idMatiere: Number(form.idMatiere) };
    try {
      if (editing) {
        await api.put(`/bibliotheque/${editing.id}`, payload);
      } else {
        await api.post('/bibliotheque', payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const filtered = livres.filter(l => {
    if (search && !`${l.titre} ${l.auteur}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCycle && l.cycle !== filterCycle) return false;
    return true;
  });

  return (
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
          {cycles.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(livre => (
          <div key={livre.id} className="bg-white rounded-[var(--radius-lg)] border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
              {livre.couvertureUrl ? (
                <img src={livre.couvertureUrl} alt={livre.titre} className="w-full h-full object-cover" />
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
                {livre.pdfUrl && <a href={livre.pdfUrl} target="_blank" rel="noreferrer" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Voir PDF</a>}
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
                  <select value={form.cycle} onChange={e => setForm({...form, cycle: e.target.value})}>
                    {cycles.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Classe concernée</label>
                  <input value={form.classeConcernee} onChange={e => setForm({...form, classeConcernee: e.target.value})} required />
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
                  <label>URL couverture</label>
                  <input value={form.couvertureUrl} onChange={e => setForm({...form, couvertureUrl: e.target.value})} />
                </div>
                <div className="admin-field">
                  <label>URL PDF</label>
                  <input value={form.pdfUrl} onChange={e => setForm({...form, pdfUrl: e.target.value})} />
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
  );
};

export default BibliothequePage;
