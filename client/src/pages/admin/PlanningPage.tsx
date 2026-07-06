import { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, User as UserIcon, Plus, Trash2, X, Edit2, DoorOpen } from 'lucide-react';
import api from '../../services/axiosInstance';
import { useTranslation } from '../../i18n/LanguageContext';
import { notifySuccess, notifyError } from '../../utils/notifications';
import ConfirmModal from '../../components/ConfirmModal';

interface PlanningEntry {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  cours: {
    idCours: number;
    matiere: { nom: string };
    enseignant: { nom: string; prenom: string } | null;
  };
  salle: { idSalle: number; libelle: string };
}

interface Classe {
  idClasse: number;
  libelle: string;
}

interface Cours {
  idCours: number;
  matiere: { nom: string };
  enseignant: { nom: string; prenom: string } | null;
}

interface Salle {
  idSalle: number;
  libelle: string;
}

const PlanningPage = () => {
  const { t } = useTranslation();
  const jours = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];

  // Mode: 'classe' ou 'salle'
  const [mode, setMode] = useState<'salle' | 'classe'>('salle');

  const [classes, setClasses] = useState<Classe[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [selectedClasse, setSelectedClasse] = useState("");
  const [selectedSalle, setSelectedSalle] = useState("");

  const [plannings, setPlannings] = useState<PlanningEntry[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [form, setForm] = useState({ idCours: '', idSalle: '', jour: 'LUNDI', heureDebut: '08:00', heureFin: '10:00' });
  const [confirmState, setConfirmState] = useState<{open:boolean;onConfirm:()=>void;message:string}>({open:false,onConfirm:()=>{},message:''});

  useEffect(() => { loadInitial(); }, []);

  useEffect(() => {
    if (mode === 'classe' && selectedClasse) loadPlannings();
  }, [selectedClasse, mode]);

  useEffect(() => {
    if (mode === 'salle' && selectedSalle) loadPlannings();
  }, [selectedSalle, mode]);

  const loadInitial = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/enrollments/classes'),
        api.get('/salles'),
      ]);
      const cls = Array.isArray(cRes.data) ? cRes.data : [];
      const sls = Array.isArray(sRes.data) ? sRes.data : [];
      setClasses(cls);
      setSalles(sls);
      if (sls.length > 0) setSelectedSalle(String(sls[0].idSalle));
    } catch (err) { console.error("Erreur chargement", err); }
  };

  const loadPlannings = async () => {
    try {
      if (mode === 'classe' && selectedClasse) {
        const res = await api.get(`/planning/classe/${selectedClasse}`);
        setPlannings(Array.isArray(res.data) ? res.data : []);
      } else if (mode === 'salle' && selectedSalle) {
        const res = await api.get(`/planning/salle/${selectedSalle}`);
        setPlannings(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) { console.error("Erreur chargement planning", err); }
  };

  const openAddModal = async () => {
    setEditingId(null);
    await loadFormData();
    setForm({
      idCours: '',
      idSalle: mode === 'salle' ? selectedSalle : '',
      jour: 'LUNDI',
      heureDebut: '08:00',
      heureFin: '10:00',
    });
    setShowModal(true);
  };

  const openEditModal = async (entry: PlanningEntry) => {
    setEditingId(entry.id);
    await loadFormData();
    setForm({
      idCours: String(entry.cours.idCours),
      idSalle: String(entry.salle.idSalle),
      jour: entry.jour,
      heureDebut: entry.heureDebut,
      heureFin: entry.heureFin,
    });
    setShowModal(true);
  };

  const loadFormData = async () => {
    try {
      if (mode === 'salle' && selectedSalle) {
        const [coursRes] = await Promise.all([
          api.get(`/planning/cours-salle/${selectedSalle}`),
        ]);
        setCoursList(Array.isArray(coursRes.data) ? coursRes.data : []);
      } else if (mode === 'classe' && selectedClasse) {
        const [coursRes] = await Promise.all([
          api.get(`/planning/cours/${selectedClasse}`),
        ]);
        setCoursList(Array.isArray(coursRes.data) ? coursRes.data : []);
      }
    } catch (err) { console.error("Erreur chargement data", err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, idCours: Number(form.idCours), idSalle: Number(form.idSalle) };
      if (editingId) {
        await api.put(`/planning/${editingId}`, payload);
      } else {
        await api.post('/planning', payload);
      }
      setShowModal(false);
      loadPlannings();
    } catch (err: any) {
      notifyError(err.response?.data?.error || "Erreur");
    }
  };

  const handleDelete = (id: number) => {
    setConfirmState({open:true, onConfirm:async () => {
      try {
        await api.delete(`/planning/${id}`);
        loadPlannings();
      } catch (err) { console.error("Erreur suppression", err); }
      setConfirmState(prev => ({...prev, open: false}));
    }, message:"Supprimer ce créneau ?"});
  };

  const getPlanningsByJour = (jour: string) => plannings.filter(p => p.jour === jour);

  const salleLibelle = selectedSalle ? salles.find(s => s.idSalle === Number(selectedSalle))?.libelle : '';
  const classeLibelle = selectedClasse ? classes.find(c => c.idClasse === Number(selectedClasse))?.libelle : '';

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
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <CalendarDays size={18} style={{ color: 'var(--navy)' }} />
          Emploi du Temps
        </h2>
        <div className="flex items-center gap-3">
          {mode === 'salle' && (
            <select className="border border-gray-200 rounded-[var(--radius)] py-1.5 px-3 text-sm outline-none focus:border-[var(--accent)]" value={selectedSalle} onChange={e => setSelectedSalle(e.target.value)}>
              {salles.map(s => (
                <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
              ))}
            </select>
          )}
          {mode === 'classe' && (
            <select className="border border-gray-200 rounded-[var(--radius)] py-1.5 px-3 text-sm outline-none focus:border-[var(--accent)]" value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}>
              {classes.map(c => (
                <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
              ))}
            </select>
          )}
          <button onClick={openAddModal} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-white text-sm font-semibold hover:brightness-110 transition-all" style={{ background: 'var(--navy)' }}>
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-4 border-b border-gray-200 mb-4">
        <button onClick={() => setMode('salle')}
          className={`pb-2 text-sm font-semibold transition border-b-2 ${mode === 'salle' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <DoorOpen size={14} className="inline mr-1" /> Par salle
        </button>
        <button onClick={() => setMode('classe')}
          className={`pb-2 text-sm font-semibold transition border-b-2 ${mode === 'classe' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          <CalendarDays size={14} className="inline mr-1" /> Par classe
        </button>
      </div>

      {/* Title */}
      {mode === 'salle' && selectedSalle && (
        <p className="text-sm text-gray-500 mb-4">
          Planning de la salle : <strong className="text-gray-800">{salleLibelle}</strong>
        </p>
      )}
      {mode === 'classe' && selectedClasse && (
        <p className="text-sm text-gray-500 mb-4">
          Planning de la classe : <strong className="text-gray-800">{classeLibelle}</strong>
        </p>
      )}

      {!selectedSalle && mode === 'salle' && (
        <p className="text-sm text-gray-400 italic">Sélectionnez une salle pour voir son emploi du temps.</p>
      )}
      {!selectedClasse && mode === 'classe' && (
        <p className="text-sm text-gray-400 italic">Sélectionnez une classe pour voir son emploi du temps.</p>
      )}

      {((mode === 'salle' && selectedSalle) || (mode === 'classe' && selectedClasse)) && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {jours.map(jour => (
            <div key={jour} className="bg-white rounded-[var(--radius-lg)] shadow-sm border border-gray-100 min-h-[500px]">
              <div className="bg-gray-50 p-3 text-center font-bold border-b border-gray-100 text-gray-600 rounded-t-[var(--radius-lg)]">{jour}</div>
              <div className="p-2 space-y-3">
                {getPlanningsByJour(jour).length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Aucun cours</p>
                ) : (
                  getPlanningsByJour(jour).map(p => (
                    <div key={p.id} className="group relative bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r-[var(--radius)]">
                      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(p)} className="p-1 rounded hover:bg-blue-100 text-blue-600">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1 rounded hover:bg-red-100 text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Clock size={12}/> {p.heureDebut} - {p.heureFin}</p>
                      <p className="font-bold text-sm text-gray-800 mt-1">{p.cours?.matiere?.nom || 'Matière'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-2"><UserIcon size={12}/> {p.cours?.enseignant?.prenom} {p.cours?.enseignant?.nom}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> {p.salle?.libelle}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--navy)' }}>
                {editingId ? 'Modifier le créneau' : 'Ajouter un créneau'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Matière (Professeur)</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--accent)] bg-white" value={form.idCours} onChange={e => setForm({...form, idCours: e.target.value})} required>
                  <option value="">Sélectionner...</option>
                  {coursList.map(c => (
                    <option key={c.idCours} value={c.idCours}>
                      {c.matiere.nom} — {c.enseignant ? `${c.enseignant.prenom} ${c.enseignant.nom}` : 'Aucun professeur'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Salle</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--accent)] bg-white" value={form.idSalle} onChange={e => setForm({...form, idSalle: e.target.value})} required>
                  <option value="">Sélectionner...</option>
                  {salles.map(s => (
                    <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Jour</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--accent)] bg-white" value={form.jour} onChange={e => setForm({...form, jour: e.target.value})}>
                  {jours.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Début</label>
                  <input type="time" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--accent)]" value={form.heureDebut} onChange={e => setForm({...form, heureDebut: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Fin</label>
                  <input type="time" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--accent)]" value={form.heureFin} onChange={e => setForm({...form, heureFin: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-lg text-white font-semibold text-sm hover:brightness-110 transition-all" style={{ background: 'var(--navy)' }}>
                {editingId ? 'Modifier le créneau' : 'Ajouter le créneau'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default PlanningPage;
