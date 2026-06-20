import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, AlertTriangle, Filter, Users } from 'lucide-react';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';

interface Student {
  id: number;
  matricule: number;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  niveau: string;
  classroom?: { idClasse: number; libelle: string } | null;
  salle?: { idSalle: number; nom: string } | null;
}

interface Classe {
  idClasse: number;
  libelle: string;
}

interface Salle {
  id: number;
  nom: string;
  capacite: number;
  statut: string;
}

const cycles = ['Premier cycle', 'Deuxieme cycle', 'Troisieme cycle'];

const cycleOptions = [
  { value: '', label: 'Tous les cycles' },
  ...cycles.map(c => ({ value: c, label: c })),
];

const getCycle = (niveau: string): string => {
  const n = niveau?.toLowerCase() || '';
  if (/^(cp|ce|cm|sil)/i.test(n)) return 'Premier cycle';
  if (/^[3-6]e/i.test(n)) return 'Deuxieme cycle';
  if (/^(2nde|1ere|tle|terminale)/i.test(n)) return 'Troisieme cycle';
  return '';
};

export default function StudentList() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');

  const [classes, setClasses] = useState<Classe[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({ nom: '', prenom: '', niveau: '', salleId: '' });

  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchSalles();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students');
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Erreur de chargement des eleves');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/enrollments/classes');
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch {
      console.error('Failed to load classes');
    }
  };

  const fetchSalles = async () => {
    try {
      const res = await api.get('/salles');
      setSalles(Array.isArray(res.data) ? res.data : []);
    } catch {
      console.error('Failed to load salles');
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !search || (s.nom || '').toLowerCase().includes(q) || (s.prenom || '').toLowerCase().includes(q);
    const matchClasse = !selectedClasse || s.classroom?.idClasse?.toString() === selectedClasse;
    const matchCycle = !selectedCycle || getCycle(s.niveau) === selectedCycle;
    return matchSearch && matchClasse && matchCycle;
  });

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setEditForm({
      nom: s.nom,
      prenom: s.prenom,
      niveau: s.niveau || '',
      salleId: s.salle?.idSalle?.toString() || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await api.put(`/students/${editingStudent.matricule}`, {
        nom: editForm.nom,
        prenom: editForm.prenom,
        niveau: editForm.niveau,
        salleId: editForm.salleId ? parseInt(editForm.salleId) : null,
      });
      setEditingStudent(null);
      fetchStudents();
    } catch {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    try {
      await api.delete(`/students/${deletingStudent.matricule}`);
      setDeletingStudent(null);
      fetchStudents();
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-400">{t('common.loading')}</div>;
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <Users size={18} style={{ color: 'var(--navy)' }} />
          {t('student.list')}
        </h2>
        <span className="text-xs text-gray-400">{filteredStudents.length} élèves</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
            <Search size={15} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('student.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-[8px] outline-none text-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
            <Filter size={15} className="text-gray-400" />
          </div>
          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-[8px] outline-none text-sm appearance-none bg-white focus:border-[var(--accent)]"
          >
            <option value="">{t('student.allClasses')}</option>
            {classes.map((c) => (
              <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
            <Filter size={15} className="text-gray-400" />
          </div>
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-[8px] outline-none text-sm appearance-none bg-white focus:border-[var(--accent)]"
          >
            {cycleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-base font-medium">{t('student.noStudents')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                <th className="px-3 py-3">{t('student.matricule')}</th>
                <th className="px-3 py-3">{t('student.lastname')}</th>
                <th className="px-3 py-3">{t('student.firstname')}</th>
                <th className="px-3 py-3">{t('student.level')}</th>
                <th className="px-3 py-3">{t('student.class')}</th>
                <th className="px-3 py-3">{t('student.birthDate')}</th>
                <th className="px-3 py-3">{t('student.room')}</th>
                <th className="px-3 py-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((s) => (
                <tr key={s.matricule} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-gray-800">{s.matricule}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">{s.nom}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">{s.prenom}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">{s.niveau || '—'}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">{s.classroom?.libelle || '—'}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">
                    {s.dateNaissance ? new Date(s.dateNaissance).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600">{s.salle?.nom || '—'}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEditModal(s)} className="p-1.5 text-[var(--navy)] hover:bg-[var(--accent-light)] rounded transition" title={t('common.edit')}>
                        <Edit size={15} />
                      </button>
                      <button onClick={() => setDeletingStudent(s)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition" title={t('common.delete')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">{t('student.editTitle')}</h2>
              <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="admin-form">
              <div className="admin-field">
                <label>{t('student.lastname')}</label>
                <input type="text" required value={editForm.nom} onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>{t('student.firstname')}</label>
                <input type="text" required value={editForm.prenom} onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>{t('student.level')}</label>
                <input type="text" required value={editForm.niveau} onChange={(e) => setEditForm({ ...editForm, niveau: e.target.value })} placeholder="ex: 6e, 5e, CM1..." />
              </div>
              <div className="admin-field">
                <label>{t('student.room')}</label>
                <select value={editForm.salleId} onChange={(e) => setEditForm({ ...editForm, salleId: e.target.value })}>
                  <option value="">Aucune salle</option>
                  {salles.map((sl) => (
                    <option key={sl.id} value={sl.id}>{sl.nom} (Cap. {sl.capacite})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingStudent(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="flex-1 btn-admin justify-center">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t('student.deleteTitle')}</h2>
            <p className="text-gray-500 text-sm mb-6">
              {t('student.deleteConfirm')} <strong>{deletingStudent.prenom} {deletingStudent.nom}</strong> ?
              <br />{t('student.deleteWarning')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingStudent(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">
                {t('common.cancel')}
              </button>
              <button onClick={handleDelete} className="flex-1 btn-admin-danger justify-center py-2.5">
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
