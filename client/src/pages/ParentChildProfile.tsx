import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  User, BookOpen, MapPin, GraduationCap, ShieldCheck,
  FileBarChart, Calendar, Camera, ChevronLeft, Users, Pencil, Check, X
} from 'lucide-react';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';

interface ChildProfile {
  matricule: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: number;
  niveau: string;
  photoURL: string | null;
  soldePoints: number;
  statut: string;
  classroom: {
    idClasse: number;
    libelle: string;
    cycle: { libelle: string };
    responsable: { nom: string; prenom: string } | null;
    cours: Array<{
      idCours: number;
      matiere: { nom: string };
      enseignant: { nom: string; prenom: string } | null;
    }>;
  } | null;
  classroomId: number | null;
  salle: { libelle: string } | null;
  salleId: number | null;
  notes: Array<{
    id: number;
    valeur: number;
    evaluation: string;
    matiere: { nom: string };
  }>;
  incidents: Array<{
    id: number;
    type: string;
    date: string;
    gravite: string;
    pointsDeduites: number;
    commentaire: string;
  }>;
}

interface ClasseItem {
  idClasse: number;
  libelle: string;
  cycle?: { libelle: string };
}

const ParentChildProfile = () => {
  const { matricule } = useParams();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [activeTab, setActiveTab] = useState('infos');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ niveau: '', classroomId: '', salleId: '' });
  const [classes, setClasses] = useState<ClasseItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!matricule) return;
    loadProfile();
    api.get('/enrollments/classes').then(res => setClasses(res.data)).catch(() => {});

    // Poll every 5s for live updates while tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadProfile();
    }, 5000);
    const onVisible = () => { if (document.visibilityState === 'visible') loadProfile(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [matricule]);

  const loadProfile = () => {
    if (!matricule) return;
    setLoading(true);
    api.get(`/enrollments/child/${matricule}`)
      .then(res => {
        setProfile(res.data);
        setEditForm({
          niveau: res.data.niveau || '',
          classroomId: res.data.classroomId ? String(res.data.classroomId) : '',
          salleId: res.data.salleId ? String(res.data.salleId) : '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !matricule) return;
    const reader = new FileReader();
    reader.onload = () => {
      api.patch(`/enrollments/child/${matricule}/photo`, { photoURL: reader.result })
        .then(res => setProfile(prev => prev ? { ...prev, photoURL: res.data.photoURL } : prev))
        .catch(() => {});
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSchool = async () => {
    if (!matricule) return;
    setSaving(true);
    try {
      await api.patch(`/enrollments/child/${matricule}/school`, {
        niveau: editForm.niveau,
        classroomId: editForm.classroomId || null,
        salleId: editForm.salleId || null,
      });
      setEditing(false);
      loadProfile();
    } catch (err) {
      alert("Erreur de mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-card p-8 text-center text-gray-400">{t('common.loading')}</div>;
  if (!profile) return <div className="admin-card p-8 text-center text-gray-400">{t('common.noData')}</div>;

  const tabs = [
    { key: 'infos', label: 'Informations', icon: User },
    { key: 'notes', label: 'Notes', icon: FileBarChart },
    { key: 'discipline', label: 'Discipline', icon: ShieldCheck },
    { key: 'cours', label: 'Professeurs', icon: Users },
  ];

  return (
    <div>
      <div className="admin-card mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--navy)] text-white rounded-full flex items-center justify-center shadow-md hover:brightness-110 transition-all"
            >
              <Camera size={12} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile.prenom} {profile.nom}</h2>
            <p className="text-sm text-gray-500">{profile.classroom?.libelle || profile.niveau}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><MapPin size={12} /> {profile.salle?.libelle || '—'}</span>
              <span className="flex items-center gap-1"><GraduationCap size={12} /> {profile.classroom?.cycle?.libelle || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[var(--navy)] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'infos' && (
        <div className="admin-card">
          {!editing ? (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <Pencil size={14} /> Modifier les infos scolaires
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Matricule</label>
                  <p className="text-gray-800 font-medium mt-1">{profile.matricule}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Statut</label>
                  <p className="text-gray-800 font-medium mt-1">{profile.statut}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Date de naissance</label>
                  <p className="text-gray-800 font-medium mt-1">{new Date(profile.dateNaissance).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Lieu de naissance</label>
                  <p className="text-gray-800 font-medium mt-1">{profile.lieuNaissance}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Sexe</label>
                  <p className="text-gray-800 font-medium mt-1">{profile.sexe === 1 ? 'Garçon' : 'Fille'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Niveau</label>
                  <p className="text-gray-800 font-medium mt-1">{profile.niveau}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Classe</label>
                  <p className="text-gray-800 font-medium mt-1">{profile.classroom?.libelle || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Salle</label>
                  <p className="text-gray-800 font-medium mt-1">{profile.salle?.libelle || '—'}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Modifier les informations scolaires</h3>
              <p className="text-xs text-gray-400 mb-4">Les informations personnelles (nom, prénom, date de naissance, sexe) sont verrouillées.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Nom</label>
                  <p className="text-gray-800 font-medium mt-1 bg-gray-50 p-2 rounded">{profile.nom}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Prénom</label>
                  <p className="text-gray-800 font-medium mt-1 bg-gray-50 p-2 rounded">{profile.prenom}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Date de naissance</label>
                  <p className="text-gray-800 font-medium mt-1 bg-gray-50 p-2 rounded">{new Date(profile.dateNaissance).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Sexe</label>
                  <p className="text-gray-800 font-medium mt-1 bg-gray-50 p-2 rounded">{profile.sexe === 1 ? 'Garçon' : 'Fille'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Niveau</label>
                  <input
                    value={editForm.niveau}
                    onChange={e => setEditForm({ ...editForm, niveau: e.target.value })}
                    className="w-full border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Classe</label>
                  <select
                    value={editForm.classroomId}
                    onChange={e => setEditForm({ ...editForm, classroomId: e.target.value })}
                    className="w-full border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm mt-1"
                  >
                    <option value="">Aucune classe</option>
                    {classes.map(cl => (
                      <option key={cl.idClasse} value={cl.idClasse}>{cl.libelle}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Salle</label>
                  <input
                    value={editForm.salleId}
                    onChange={e => setEditForm({ ...editForm, salleId: e.target.value })}
                    placeholder="ID de la salle"
                    className="w-full border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition"
                >
                  <X size={16} /> Annuler
                </button>
                <button
                  onClick={handleSaveSchool}
                  disabled={saving}
                  className="inline-flex items-center gap-1 bg-[var(--navy)] text-white px-4 py-2 rounded-[var(--radius)] font-semibold hover:brightness-110 transition"
                >
                  <Check size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="admin-card">
          {profile.notes.length === 0 ? (
            <p className="text-center text-gray-400 py-8">{t('common.noData')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                    <th className="p-4">Matière</th>
                    <th className="p-4">Note / 20</th>
                    <th className="p-4">Évaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {profile.notes.map(n => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium">{n.matiere.nom}</td>
                      <td className="p-4"><span className="font-bold">{n.valeur.toFixed(2)}</span></td>
                      <td className="p-4 text-sm text-gray-500">{n.evaluation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'discipline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Solde de conduite</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--navy)' }}>{profile.soldePoints} / 20</p>
            </div>
            <div className={`w-4 h-4 rounded-full ${profile.soldePoints < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold">Historique des incidents</div>
            {profile.incidents.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">Aucun incident signalé.</div>
            ) : (
              profile.incidents.map(inc => (
                <div key={inc.id} className="p-4 border-b last:border-0 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-red-600">-{inc.pointsDeduites} points</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                        inc.gravite === 'Haute' ? 'bg-red-100 text-red-700' :
                        inc.gravite === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                      }`}>{inc.gravite}</span>
                    </div>
                    <span className="text-sm text-gray-400">{new Date(inc.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-sm font-medium mt-1">{inc.type}</p>
                  {inc.commentaire && <p className="text-xs text-gray-500 italic mt-1">"{inc.commentaire}"</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'cours' && (
        <div className="admin-card">
          {!profile.classroom?.cours || profile.classroom.cours.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucun professeur assigné.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.classroom.cours.map(c => (
                <div key={c.idCours} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-[var(--navy)]/10 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-[var(--navy)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{c.matiere.nom}</p>
                    <p className="text-sm text-gray-500">{c.enseignant ? `${c.enseignant.prenom} ${c.enseignant.nom}` : 'Non assigné'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentChildProfile;
