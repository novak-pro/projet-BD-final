import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, AlertTriangle, Filter, Users, FileText, School } from 'lucide-react';
import api from '../services/axiosInstance';
import { enrollmentService } from '../services/enrollmentService';
import { useTranslation } from '../i18n/LanguageContext';
import { notifySuccess, notifyError } from '../utils/notifications';

interface AnneeAcademique {
  idAcademi: number;
  libelle: string;
  active: boolean;
}

interface Student {
  matricule: number;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  lieuNaissance: string | null;
  sexe: number;
  langue: string;
  photoURL: string | null;
  statut: string;
  niveau: string;
  classroom?: { idClasse: number; libelle: string } | null;
  salle?: { idSalle: number; libelle: string; capacite?: number | null } | null;
  frequences?: FrequenteEntry[];
}

interface FrequenteEntry {
  idFrequente: number;
  idEleve: number;
  idSalle: number;
  idAcademi: number;
  classe: { idClasse: number; libelle: string };
  annee: { idAcademi: number; libelle: string; active: boolean };
}

interface Classe {
  idClasse: number;
  libelle: string;
}

interface Salle {
  idSalle: number;
  libelle: string;
  capacite: number | null;
}

interface EnrollmentRequest {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: number;
  niveau: string;
  classe: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  recuPDF: string | null;
  modePaiement: string | null;
  parent: { nom: string; prenom: string; telephone: string };
  createdAt: string;
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
  const [tab, setTab] = useState<'eleves' | 'inscriptions' | 'classes' | 'cycles'>('eleves');

  // Élèves
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedAnneeId, setSelectedAnneeId] = useState('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({ nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '0', langue: 'Français', niveau: '', statut: 'Inscrit', salleId: '', classeId: '' });
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Inscriptions
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [classesList, setClassesList] = useState<Classe[]>([]);
  const [approveModal, setApproveModal] = useState<{ id: number } | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  // Classes
  const [cycles, setCycles] = useState<{ idCycle: number; libelle: string }[]>([]);
  const [showClasseForm, setShowClasseForm] = useState(false);
  const [classeForm, setClasseForm] = useState({ libelle: '', idCycle: '' });
  const [editingClasse, setEditingClasse] = useState<Classe & { cycle?: { idCycle: number; libelle: string } | null; _count?: { students: number } } | null>(null);
  const [deletingClasse, setDeletingClasse] = useState<Classe | null>(null);
  // Cycles
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [cycleForm, setCycleForm] = useState({ libelle: '', description: '' });
  const [editingCycle, setEditingCycle] = useState<{ idCycle: number; libelle: string; description?: string | null; _count?: { classes: number } } | null>(null);
  const [deletingCycle, setDeletingCycle] = useState<{ idCycle: number; libelle: string } | null>(null);

  const fetchAnnees = async () => {
    try {
      const res = await api.get('/academique/annees');
      setAnnees(Array.isArray(res.data) ? res.data : []);
    } catch { console.error('Failed to load annees'); }
  };

  useEffect(() => {
    fetchAnnees();
    fetchStudents();
    fetchClasses();
    fetchSalles();
    fetchEnrollments();
    fetchAllClasses();
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const res = await api.get('/enrollments/cycles');
      setCycles(Array.isArray(res.data) ? res.data : []);
    } catch { console.error('Failed to load cycles'); }
  };

  const fetchStudents = async (anneeId?: string) => {
    try {
      setLoading(true);
      const params = anneeId ? `?anneeId=${anneeId}` : '';
      const res = await api.get(`/students/with-frequente${params}`);
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Erreur de chargement des eleves');
    } finally {
      setLoading(false);
    }
  };

  const handleAnneeChange = (val: string) => {
    setSelectedAnneeId(val);
    fetchStudents(val || undefined);
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/enrollments/classes');
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch { console.error('Failed to load classes'); }
  };

  const fetchSalles = async () => {
    try {
      const res = await api.get('/salles');
      setSalles(Array.isArray(res.data) ? res.data : []);
    } catch { console.error('Failed to load salles'); }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await enrollmentService.getAll();
      setRequests(res.data);
    } catch { console.error('Erreur chargement inscriptions'); }
  };

  const fetchAllClasses = async () => {
    try {
      const res = await api.get('/enrollments/classes');
      setClassesList(Array.isArray(res.data) ? res.data : []);
    } catch { console.error('Erreur chargement classes'); }
  };

  const getStudentClass = (s: Student): string => {
    if (selectedAnneeId) {
      const f = s.frequences?.find(fr => fr.idAcademi === parseInt(selectedAnneeId));
      if (f) return f.classe.libelle;
    }
    const latest = s.frequences?.[0];
    if (latest) return latest.classe.libelle;
    return s.classroom?.libelle || '—';
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !search || (s.nom || '').toLowerCase().includes(q) || (s.prenom || '').toLowerCase().includes(q);
    const matchClasse = !selectedClasse || s.frequences?.some(f => f.classe.idClasse === parseInt(selectedClasse));
    const matchCycle = !selectedCycle || getCycle(s.niveau) === selectedCycle;
    return matchSearch && matchClasse && matchCycle;
  });

  const openEditModal = (s: Student) => {
    const latestFreq = s.frequences?.[0];
    setEditingStudent(s);
    setEditForm({
      nom: s.nom,
      prenom: s.prenom,
      dateNaissance: s.dateNaissance ? s.dateNaissance.split('T')[0] : '',
      lieuNaissance: s.lieuNaissance || '',
      sexe: String(s.sexe ?? 0),
      langue: s.langue || 'Français',
      niveau: s.niveau || '',
      statut: s.statut || 'Inscrit',
      salleId: s.salle?.idSalle?.toString() || '',
      classeId: latestFreq?.idSalle?.toString() || s.classroom?.idClasse?.toString() || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await api.put(`/students/${editingStudent.matricule}`, {
        nom: editForm.nom,
        prenom: editForm.prenom,
        dateNaissance: editForm.dateNaissance || undefined,
        lieuNaissance: editForm.lieuNaissance,
        sexe: parseInt(editForm.sexe),
        langue: editForm.langue,
        niveau: editForm.niveau,
        statut: editForm.statut,
        classroomId: editForm.classeId ? parseInt(editForm.classeId) : null,
        salleId: editForm.salleId ? parseInt(editForm.salleId) : null,
      });
      setEditingStudent(null);
      fetchStudents(selectedAnneeId || undefined);
    } catch { notifyError('Erreur lors de la mise à jour'); }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    try {
      await api.delete(`/students/${deletingStudent.matricule}`);
      setDeletingStudent(null);
      fetchStudents(selectedAnneeId || undefined);
    } catch { notifyError('Erreur lors de la suppression'); }
  };

  const handleReject = async (id: number) => {
    const notes = window.prompt("Motif du refus obligatoire :");
    if (!notes) { notifyError("Un motif est requis."); return; }
    try {
      await enrollmentService.process(id, 'REJECTED', notes);
      notifySuccess("Demande refusée.");
      fetchEnrollments();
    } catch { notifyError("Erreur"); }
  };

  const confirmApprove = async () => {
    if (!approveModal) return;
    try {
      await enrollmentService.process(approveModal.id, 'APPROVED', '', selectedClassroomId);
      notifySuccess("Demande validée — Élève créé.");
      setApproveModal(null);
      setSelectedClassroomId('');
      fetchEnrollments();
      fetchStudents(selectedAnneeId || undefined);
    } catch { notifyError("Erreur"); }
  };

  const handleCreateClasse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classeForm.libelle.trim()) { notifyError('Le libellé est requis'); return; }
    try {
      await api.post('/enrollments/classes', {
        libelle: classeForm.libelle.trim(),
        idCycle: classeForm.idCycle || 1,
      });
      notifySuccess('Classe créée');
      setClasseForm({ libelle: '', idCycle: '' });
      setShowClasseForm(false);
      fetchClasses();
    } catch { notifyError('Erreur lors de la création'); }
  };

  const handleUpdateClasse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClasse) return;
    try {
      await api.put(`/enrollments/classes/${editingClasse.idClasse}`, {
        libelle: editingClasse.libelle,
        idCycle: (editingClasse as any).idCycle,
      });
      notifySuccess('Classe mise à jour');
      setEditingClasse(null);
      fetchClasses();
    } catch { notifyError('Erreur lors de la mise à jour'); }
  };

  const handleDeleteClasse = async () => {
    if (!deletingClasse) return;
    try {
      await api.delete(`/enrollments/classes/${deletingClasse.idClasse}`);
      notifySuccess('Classe supprimée');
      setDeletingClasse(null);
      fetchClasses();
    } catch { notifyError('Impossible de supprimer cette classe'); }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleForm.libelle.trim()) { notifyError('Le libellé est requis'); return; }
    try {
      const res = await api.post('/enrollments/cycles', {
        libelle: cycleForm.libelle.trim(),
        description: cycleForm.description.trim() || null,
      });
      notifySuccess('Cycle créé');
      setCycleForm({ libelle: '', description: '' });
      setShowCycleForm(false);
      fetchCycles();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Erreur lors de la création';
      notifyError(msg);
    }
  };

  const handleUpdateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCycle) return;
    try {
      await api.put(`/enrollments/cycles/${editingCycle.idCycle}`, {
        libelle: editingCycle.libelle,
        description: editingCycle.description || null,
      });
      notifySuccess('Cycle mis à jour');
      setEditingCycle(null);
      fetchCycles();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Erreur lors de la mise à jour';
      notifyError(msg);
    }
  };

  const handleDeleteCycle = async () => {
    if (!deletingCycle) return;
    try {
      await api.delete(`/enrollments/cycles/${deletingCycle.idCycle}`);
      notifySuccess('Cycle supprimé');
      setDeletingCycle(null);
      fetchCycles();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Impossible de supprimer ce cycle';
      notifyError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <Users size={18} style={{ color: 'var(--navy)' }} />
            Gestion des Élèves
          </h2>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('eleves')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'eleves' ? 'bg-[var(--navy)] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Users size={16} /> Élèves ({students.length})
          </button>
          <button
            onClick={() => setTab('inscriptions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'inscriptions' ? 'bg-[var(--navy)] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <FileText size={16} /> Inscriptions ({requests.filter(r => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setTab('classes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'classes' ? 'bg-[var(--navy)] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <School size={16} /> Classes ({classes.length})
          </button>
          <button
            onClick={() => setTab('cycles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'cycles' ? 'bg-[var(--navy)] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <School size={16} /> Cycles ({cycles.length})
          </button>
        </div>

        {tab === 'eleves' && (
          <>
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
                  value={selectedAnneeId}
                  onChange={(e) => handleAnneeChange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-[8px] outline-none text-sm appearance-none bg-white focus:border-[var(--accent)]"
                >
                  <option value="">Toutes les années</option>
                  {annees.map((a) => (
                    <option key={a.idAcademi} value={a.idAcademi}>
                      {a.libelle} {a.active ? '(active)' : ''}
                    </option>
                  ))}
                </select>
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

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-base font-medium">Chargement...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
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
                      <th className="px-3 py-3">Année académique</th>
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
                        <td className="px-3 py-3 text-sm text-gray-600">{getStudentClass(s)}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">
                          {s.dateNaissance ? new Date(s.dateNaissance).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600">{s.salle?.libelle || '—'}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">
                          {s.frequences?.[0]?.annee?.libelle || '—'}
                        </td>
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
                <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">{t('student.editTitle')}</h2>
                    <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="admin-field">
                        <label>{t('student.lastname')} *</label>
                        <input type="text" required value={editForm.nom} onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })} />
                      </div>
                      <div className="admin-field">
                        <label>{t('student.firstname')} *</label>
                        <input type="text" required value={editForm.prenom} onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="admin-field">
                        <label>{t('student.birthDate')} *</label>
                        <input type="date" required value={editForm.dateNaissance} onChange={(e) => setEditForm({ ...editForm, dateNaissance: e.target.value })} />
                      </div>
                      <div className="admin-field">
                        <label>Lieu de naissance</label>
                        <input type="text" value={editForm.lieuNaissance} onChange={(e) => setEditForm({ ...editForm, lieuNaissance: e.target.value })} placeholder="ex: Yaoundé" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="admin-field">
                        <label>Sexe</label>
                        <select value={editForm.sexe} onChange={(e) => setEditForm({ ...editForm, sexe: e.target.value })}>
                          <option value="0">Féminin</option>
                          <option value="1">Masculin</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>Langue</label>
                        <input type="text" value={editForm.langue} onChange={(e) => setEditForm({ ...editForm, langue: e.target.value })} placeholder="Français" />
                      </div>
                    </div>
                    <div className="admin-field">
                      <label>{t('student.level')} *</label>
                      <input type="text" required value={editForm.niveau} onChange={(e) => setEditForm({ ...editForm, niveau: e.target.value })} placeholder="ex: SIL, CP, CE1..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="admin-field">
                        <label>Classe</label>
                        <select value={editForm.classeId} onChange={(e) => setEditForm({ ...editForm, classeId: e.target.value })}>
                          <option value="">Aucune classe</option>
                          {classes.map((c) => (
                            <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-field">
                        <label>{t('student.room')}</label>
                        <select value={editForm.salleId} onChange={(e) => setEditForm({ ...editForm, salleId: e.target.value })}>
                          <option value="">Aucune salle</option>
                          {salles.map((sl) => (
                            <option key={sl.idSalle} value={sl.idSalle}>{sl.libelle} {sl.capacite ? `(Cap. ${sl.capacite})` : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setEditingStudent(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">{t('common.cancel')}</button>
                      <button type="submit" className="flex-1 btn-admin justify-center">{t('common.save')}</button>
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
                    <button onClick={() => setDeletingStudent(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">{t('common.cancel')}</button>
                    <button onClick={handleDelete} className="flex-1 btn-admin-danger justify-center py-2.5">{t('common.delete')}</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'inscriptions' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="admin-badge" style={{ background: 'var(--navy)', color: '#fff' }}>
                {requests.filter(r => r.status === 'PENDING').length} demande(s) en attente
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                    <th className="px-3 py-3">Enfant</th>
                    <th className="px-3 py-3">Parent</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Cycle / Classe</th>
                    <th className="px-3 py-3">Paiement</th>
                    <th className="px-3 py-3">Statut</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3">
                        <div className="font-bold text-gray-800 text-sm">{req.prenom} {req.nom}</div>
                        <div className="text-xs text-gray-500">Né(e) le {new Date(req.dateNaissance).toLocaleDateString()} ({req.sexe === 0 ? 'F' : 'M'})</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {req.parent.prenom} {req.parent.nom}<br />
                        <span className="text-gray-400">{req.parent.telephone}</span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-3 text-sm">
                        <span className="font-medium">{req.niveau}</span>
                        {req.classe && <span className="text-gray-400"> — {req.classe}</span>}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex flex-col gap-1">
                          {req.modePaiement ? (
                            <span className="text-xs font-medium text-gray-600">
                              {req.modePaiement === 'CASH' ? 'Cash école' : 'Virement'}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                          {req.recuPDF ? (
                            <button onClick={() => window.open(req.recuPDF!, '_blank')}
                              className="text-xs text-blue-600 underline text-left">Voir la facture</button>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium">Aucune facture</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`admin-badge ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {req.status === 'PENDING' ? 'À traiter' : req.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {req.status === 'PENDING' ? (
                          <div className="flex justify-center gap-2">
                            <button onClick={() => setApproveModal({ id: req.id })}
                              className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700">
                              Valider
                            </button>
                            <button onClick={() => handleReject(req.id)}
                              className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700">
                              Refuser
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Traité</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {requests.length === 0 && (
                <div className="p-10 text-center text-gray-400">Aucune demande d'inscription.</div>
              )}
            </div>
          </>
        )}
        {tab === 'classes' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="admin-badge" style={{ background: 'var(--navy)', color: '#fff' }}>
                {classes.length} classe(s)
              </span>
              <button onClick={() => setShowClasseForm(true)}
                className="inline-flex items-center gap-1 bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition">
                + Nouvelle classe
              </button>
            </div>

            {/* Formulaire création */}
            {showClasseForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <form onSubmit={handleCreateClasse} className="flex flex-wrap gap-3 items-end">
                  <div className="admin-field flex-1 min-w-[200px] mb-0">
                    <label>Libellé *</label>
                    <input type="text" required value={classeForm.libelle} onChange={(e) => setClasseForm({ ...classeForm, libelle: e.target.value })}
                      placeholder="ex: CM2 A" />
                  </div>
                  <div className="admin-field min-w-[180px] mb-0">
                    <label>Cycle</label>
                    <select value={classeForm.idCycle} onChange={(e) => setClasseForm({ ...classeForm, idCycle: e.target.value })}>
                      <option value="">Sélectionner...</option>
                      {cycles.map((c) => (
                        <option key={c.idCycle} value={c.idCycle}>{c.libelle}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-admin justify-center">Créer</button>
                    <button type="button" onClick={() => { setShowClasseForm(false); setClasseForm({ libelle: '', idCycle: '' }); }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
                  </div>
                </form>
              </div>
            )}

            {classes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-base font-medium">Aucune classe. Créez-en une !</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                      <th className="px-3 py-3">Libellé</th>
                      <th className="px-3 py-3">Cycle</th>
                      <th className="px-3 py-3">Élèves</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {classes.map((cl: any) => (
                      <tr key={cl.idClasse} className="hover:bg-gray-50 transition-colors">
                        {editingClasse?.idClasse === cl.idClasse ? (
                          <>
                            <td className="px-3 py-2">
                              <input type="text" value={editingClasse.libelle}
                                onChange={(e) => setEditingClasse({ ...editingClasse, libelle: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm outline-none focus:border-[var(--accent)]" />
                            </td>
                            <td className="px-3 py-2">
                              <select value={(editingClasse as any).idCycle ?? ''}
                                onChange={(e) => setEditingClasse({ ...editingClasse, idCycle: Number(e.target.value) } as any)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm outline-none focus:border-[var(--accent)]">
                                <option value="">Choisir...</option>
                                {cycles.map((cy) => (
                                  <option key={cy.idCycle} value={cy.idCycle}>{cy.libelle}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600">{cl._count?.students ?? 0}</td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={handleUpdateClasse} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition" title="Enregistrer">
                                  <Edit size={15} />
                                </button>
                                <button onClick={() => setEditingClasse(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition" title="Annuler">
                                  <X size={15} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-3 text-sm font-medium text-gray-800">{cl.libelle}</td>
                            <td className="px-3 py-3 text-sm text-gray-600">{cl.cycle?.libelle || '—'}</td>
                            <td className="px-3 py-3 text-sm text-gray-600">{cl._count?.students ?? '—'}</td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => setEditingClasse({ ...cl, idCycle: cl.cycle?.idCycle ?? '' })} className="p-1.5 text-[var(--navy)] hover:bg-[var(--accent-light)] rounded transition" title="Modifier">
                                  <Edit size={15} />
                                </button>
                                <button onClick={() => setDeletingClasse(cl)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition" title="Supprimer">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal suppression classe */}
            {deletingClasse && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-sm shadow-2xl text-center">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Supprimer la classe</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Voulez-vous vraiment supprimer <strong>{deletingClasse.libelle}</strong> ?
                    <br />Cette action est irréversible.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeletingClasse(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
                    <button onClick={handleDeleteClasse} className="flex-1 btn-admin-danger justify-center py-2.5">Supprimer</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {tab === 'cycles' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="admin-badge" style={{ background: 'var(--navy)', color: '#fff' }}>
                {cycles.length} cycle(s)
              </span>
              <button onClick={() => setShowCycleForm(true)}
                className="inline-flex items-center gap-1 bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition">
                + Nouveau cycle
              </button>
            </div>

            {/* Formulaire création */}
            {showCycleForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <form onSubmit={handleCreateCycle} className="flex flex-wrap gap-3 items-end">
                  <div className="admin-field flex-1 min-w-[200px] mb-0">
                    <label>Libellé *</label>
                    <input type="text" required value={cycleForm.libelle} onChange={(e) => setCycleForm({ ...cycleForm, libelle: e.target.value })}
                      placeholder="ex: Premier cycle" />
                  </div>
                  <div className="admin-field flex-1 min-w-[300px] mb-0">
                    <label>Description</label>
                    <textarea value={cycleForm.description} onChange={(e) => setCycleForm({ ...cycleForm, description: e.target.value })}
                      placeholder="Description du cycle..." rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-[8px] outline-none text-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-admin justify-center">Créer</button>
                    <button type="button" onClick={() => { setShowCycleForm(false); setCycleForm({ libelle: '', description: '' }); }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
                  </div>
                </form>
              </div>
            )}

            {cycles.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-base font-medium">Aucun cycle. Créez-en un !</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                      <th className="px-3 py-3">Libellé</th>
                      <th className="px-3 py-3">Description</th>
                      <th className="px-3 py-3">Classes</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cycles.map((cy: any) => (
                      <tr key={cy.idCycle} className="hover:bg-gray-50 transition-colors">
                        {editingCycle?.idCycle === cy.idCycle ? (
                          <>
                            <td className="px-3 py-2">
                              <input type="text" value={editingCycle.libelle}
                                onChange={(e) => setEditingCycle({ ...editingCycle, libelle: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm outline-none focus:border-[var(--accent)]" />
                            </td>
                            <td className="px-3 py-2">
                              <textarea value={editingCycle.description ?? ''}
                                onChange={(e) => setEditingCycle({ ...editingCycle, description: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm outline-none focus:border-[var(--accent)] resize-none" rows={2} />
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600">{cy._count?.classes ?? 0}</td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={handleUpdateCycle} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition" title="Enregistrer">
                                  <Edit size={15} />
                                </button>
                                <button onClick={() => setEditingCycle(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition" title="Annuler">
                                  <X size={15} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-3 text-sm font-medium text-gray-800">{cy.libelle}</td>
                            <td className="px-3 py-3 text-sm text-gray-600 max-w-[300px] truncate">{cy.description || '—'}</td>
                            <td className="px-3 py-3 text-sm text-gray-600">{cy._count?.classes ?? '—'}</td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => setEditingCycle(cy)} className="p-1.5 text-[var(--navy)] hover:bg-[var(--accent-light)] rounded transition" title="Modifier">
                                  <Edit size={15} />
                                </button>
                                <button onClick={() => setDeletingCycle(cy)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition" title="Supprimer">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal suppression cycle */}
            {deletingCycle && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-sm shadow-2xl text-center">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Supprimer le cycle</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Voulez-vous vraiment supprimer <strong>{deletingCycle.libelle}</strong> ?
                    <br />Cette action est irréversible.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeletingCycle(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
                    <button onClick={handleDeleteCycle} className="flex-1 btn-admin-danger justify-center py-2.5">Supprimer</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal approbation */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Valider l'inscription</h2>
            <p className="text-sm text-gray-500 mb-6">Assigner une classe à l'élève :</p>
            <select
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none mb-6"
            >
              <option value="">Sans classe</option>
              {classesList.map((cl) => (
                <option key={cl.idClasse} value={cl.idClasse}>{cl.libelle}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => { setApproveModal(null); setSelectedClassroomId(''); }}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
              <button onClick={confirmApprove}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-[var(--radius)] font-semibold hover:bg-green-700 transition">Valider</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
