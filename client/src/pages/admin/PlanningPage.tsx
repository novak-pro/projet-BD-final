import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, User as UserIcon, Plus, Trash2, X } from 'lucide-react';
import api from '../../services/axiosInstance';
import { useTranslation } from '../../i18n/LanguageContext';

interface PlanningEntry {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  cours: {
    matiere: { nom: string };
    enseignant: { nom: string; prenom: string };
  };
  salle: { libelle: string };
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
  const [selectedClasse, setSelectedClasse] = useState("");
  const [classes, setClasses] = useState<Classe[]>([]);
  const [plannings, setPlannings] = useState<PlanningEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [form, setForm] = useState({ idCours: '', idSalle: '', jour: 'LUNDI', heureDebut: '08:00', heureFin: '10:00' });

  useEffect(() => { loadClasses(); }, []);

  useEffect(() => {
    if (selectedClasse) loadPlannings();
  }, [selectedClasse]);

  const loadClasses = async () => {
    try {
      const res = await api.get('/enrollments/classes');
      setClasses(Array.isArray(res.data) ? res.data : []);
      if (res.data.length > 0) setSelectedClasse(String(res.data[0].idClasse));
    } catch (err) { console.error("Erreur chargement classes", err); }
  };

  const loadPlannings = async () => {
    try {
      const res = await api.get(`/planning/classe/${selectedClasse}`);
      setPlannings(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Erreur chargement planning", err); }
  };

  const openModal = async () => {
    try {
      const [coursRes, sallesRes] = await Promise.all([
        api.get(`/planning/cours/${selectedClasse}`),
        api.get('/salles')
      ]);
      setCoursList(Array.isArray(coursRes.data) ? coursRes.data : []);
      setSalles(Array.isArray(sallesRes.data) ? sallesRes.data : []);
      setForm({ idCours: '', idSalle: '', jour: 'LUNDI', heureDebut: '08:00', heureFin: '10:00' });
      setShowModal(true);
    } catch (err) { console.error("Erreur chargement data", err); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/planning', { ...form, idCours: Number(form.idCours), idSalle: Number(form.idSalle) });
      setShowModal(false);
      loadPlannings();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur lors de la création");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce créneau ?")) return;
    try {
      await api.delete(`/planning/${id}`);
      loadPlannings();
    } catch (err) { console.error("Erreur suppression", err); }
  };

  const getPlanningsByJour = (jour: string) => plannings.filter(p => p.jour === jour);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <CalendarDays size={18} style={{ color: 'var(--navy)' }} />
          Emploi du Temps
        </h2>
        <div className="flex items-center gap-3">
          <select className="border border-gray-200 rounded-[var(--radius)] py-1.5 px-3 text-sm outline-none focus:border-[var(--accent)]" value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}>
            {classes.map(c => (
              <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
            ))}
          </select>
          <button onClick={openModal} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-white text-sm font-semibold hover:brightness-110 transition-all" style={{ background: 'var(--navy)' }}>
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

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
                    <button onClick={() => handleDelete(p.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 text-red-500">
                      <Trash2 size={14} />
                    </button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--navy)' }}>Ajouter un créneau</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
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
                Ajouter le créneau
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningPage;
