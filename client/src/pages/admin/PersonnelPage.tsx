import { useEffect, useState } from 'react';
import { personnelService, matiereService } from '../../services/apiServices';
import api from '../../services/axiosInstance';
import { Users, BookOpen, GraduationCap, Edit, UserX, X, AlertTriangle, Search, ShieldCheck, UserCheck, Award, DoorOpen, School } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { notifySuccess, notifyError } from '../../utils/notifications';
import ConfirmModal from '../../components/ConfirmModal';

interface Personnel {
  id: number;
  nom: string;
  prenom: string;
  fonction: string;
  telephone: string;
  ville?: string | null;
  quartier?: string | null;
  departement?: string | null;
  photo?: string | null;
  statut: string;
  user: { email: string; status: string };
  cours: any[];
  salleTitulaire: { idSalle: number; libelle: string }[];
}

interface Salle {
  idSalle: number;
  libelle: string;
  idClasse?: number | null;
  classe?: { idClasse: number; libelle: string } | null;
  titulaire: { id: number } | null;
}

interface Matiere {
  id: number;
  nom: string;
  code?: string;
  classes?: { idClasse: number; classe?: { idClasse: number; libelle: string } }[];
}

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-5 rounded-[var(--radius-lg)] shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`${color} p-3 rounded-[var(--radius)] text-white shadow-lg`}>
      {icon}
    </div>
  </div>
);

const FONCTIONS = [
  'ENSEIGNANT', 'SURVEILLANT', 'DIRECTION', 'SECRETAIRE', 'COMPTABLE', 'ADMINISTRATIF',
];

const PersonnelPage = () => {
  const { t } = useTranslation();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [search, setSearch] = useState('');
  const [filterFonction, setFilterFonction] = useState('');

  // Edit modal
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '',
    telephone: '', fonction: 'ENSEIGNANT',
    ville: '', quartier: '', departement: '', photo: ''
  });

  // Promotion modal
  const [promoPersonnel, setPromoPersonnel] = useState<Personnel | null>(null);
  const [promoSalleId, setPromoSalleId] = useState('');

  // Affectation modal (teacher + salle + matières)
  const [showAffectModal, setShowAffectModal] = useState(false);
  const [affectData, setAffectData] = useState({ personnelId: '', salleId: '', matiereIds: [] as number[] });

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmState, setConfirmState] = useState<{open:boolean;onConfirm:()=>void;message:string}>({open:false,onConfirm:()=>{},message:''});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const pRes = await personnelService.getAll().catch(() => null);
      const sRes = await api.get('/salles').catch(() => null);
      const mRes = await matiereService.getAll().catch(() => null);
      if (pRes) setPersonnel(pRes.data);
      if (sRes) setSalles(sRes.data);
      if (mRes) setMatieres(mRes.data);
    } catch (err) {
      console.error("Erreur chargement", err);
    }
  };

  const sallesSansTitulaire = salles.filter(s => !s.titulaire);

  const enseignants = personnel.filter(p => p.fonction === 'ENSEIGNANT');
  const surveillants = personnel.filter(p => p.fonction === 'SURVEILLANT');

  const filtered = personnel.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q) || p.user.email.toLowerCase().includes(q);
    const matchFonc = !filterFonction || p.fonction === filterFonction;
    return matchSearch && matchFonc;
  });

  // --- Edit ---
  const openEditModal = (p: Personnel) => {
    setEditingId(p.id);
    setFormData({
      nom: p.nom, prenom: p.prenom, email: p.user.email,
      telephone: p.telephone, fonction: p.fonction,
      ville: p.ville || '', quartier: p.quartier || '', departement: p.departement || '', photo: p.photo || ''
    });
    setEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const payload: any = { nom: formData.nom, prenom: formData.prenom, telephone: formData.telephone, fonction: formData.fonction, ville: formData.ville, quartier: formData.quartier, departement: formData.departement, photo: formData.photo };
      if (formData.email && formData.email !== personnel.find(p => p.id === editingId)?.user.email) {
        payload.email = formData.email;
      }
      await personnelService.update(editingId, payload);
      setEditModal(false);
      loadData();
    } catch (err: any) {
      notifyError(err?.response?.data?.error || "Erreur");
    }
  };

  // --- Deactivate ---
  const handleDeactivate = async () => {
    if (deletingId === null) return;
    try {
      await personnelService.deactivate(deletingId);
      setDeletingId(null);
      loadData();
    } catch { notifyError("Erreur lors de la désactivation"); }
  };

  // --- Promotion titulaire ---
  const openPromoModal = (p: Personnel) => {
    setPromoPersonnel(p);
    setPromoSalleId('');
  };

  const handlePromouvoir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoPersonnel || !promoSalleId) return;
    try {
      await personnelService.promouvoirTitulaire({ personnelId: promoPersonnel.id, salleId: parseInt(promoSalleId) });
      setPromoPersonnel(null);
      setPromoSalleId('');
      loadData();
    } catch (err: any) {
      notifyError(err?.response?.data?.error || "Erreur");
    }
  };

  const handleRetirerPromotion = (p: Personnel) => {
    setConfirmState({open:true, onConfirm:async () => {
      try {
        await personnelService.retirerPromotion(p.id);
        loadData();
      } catch { notifyError("Erreur"); }
      setConfirmState(prev => ({...prev, open: false}));
    }, message:`Retirer la promotion titulaire de ${p.nom} ${p.prenom} ?`});
  };

  const handleToggleMatiere = (id: number) => {
    setAffectData(prev => ({
      ...prev,
      matiereIds: prev.matiereIds.includes(id)
        ? prev.matiereIds.filter(mId => mId !== id)
        : [...prev.matiereIds, id]
    }));
  };

  // --- Affectation enseignant → salle + matières ---
  const handleAffectation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await personnelService.affecterSalle({
        personnelId: parseInt(affectData.personnelId),
        salleId: parseInt(affectData.salleId),
        matiereIds: affectData.matiereIds,
      });
      setShowAffectModal(false);
      setAffectData({ personnelId: '', salleId: '', matiereIds: [] });
      loadData();
    } catch (err: any) {
      notifyError(err?.response?.data?.error || "Erreur lors de l'affectation");
    }
  };

  // Filtrer les matières selon la classe de la salle sélectionnée
  const selectedSalle = salles.find(s => s.idSalle === Number(affectData.salleId));
  const classeId = selectedSalle?.idClasse ?? selectedSalle?.classe?.idClasse;
  const filteredMatieres = classeId
    ? matieres.filter(m => m.classes?.some((mc: any) => (mc.classe?.idClasse ?? mc.idClasse) === classeId))
    : matieres;

  // Réinitialiser les matières sélectionnées quand la salle change
  const handleSalleChange = (salleId: string) => {
    setAffectData({ ...affectData, salleId, matiereIds: [] });
  };

  // Grouper les cours par salle pour l'affichage
  const coursParSalle = (cours: any[]) => {
    const grouped: Record<string, { salle: string; matieres: string[] }> = {};
    cours.forEach((c: any) => {
      if (c.salle) {
        const key = c.salle.libelle;
        if (!grouped[key]) grouped[key] = { salle: key, matieres: [] };
        if (!grouped[key].matieres.includes(c.matiere?.nom)) {
          grouped[key].matieres.push(c.matiere?.nom);
        }
      }
    });
    return Object.values(grouped);
  };

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
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard title="Total Personnel" value={personnel.length} icon={<Users size={22} />} color="bg-blue-600" />
        <StatCard title="Enseignants" value={enseignants.length} icon={<BookOpen size={22} />} color="bg-green-500" />
        <StatCard title="Surveillants" value={surveillants.length} icon={<ShieldCheck size={22} />} color="bg-amber-500" />
        <StatCard title="Affectations" value={personnel.reduce((acc, p) => acc + (p.cours?.length || 0), 0)} icon={<GraduationCap size={22} />} color="bg-indigo-500" />
      </div>

      {/* Actions bar */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <GraduationCap size={18} style={{ color: 'var(--navy)' }} />
            Gestion du Personnel
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setShowAffectModal(true)} className="btn-admin text-sm py-1.5 px-3" style={{ background: 'var(--accent)', color: '#fff' }}>
              <DoorOpen size={16} /> Affecter salle
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
              <Search size={15} className="text-gray-400" />
            </div>
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-[8px] outline-none text-sm focus:border-[var(--accent)]" />
          </div>
          <select value={filterFonction} onChange={e => setFilterFonction(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-[8px] outline-none text-sm bg-white">
            <option value="">Toutes fonctions</option>
            {FONCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                <th className="px-3 py-3">Photo</th>
                <th className="px-3 py-3">Nom</th>
                <th className="px-3 py-3">Prénom</th>
                <th className="px-3 py-3">Fonction</th>
                <th className="px-3 py-3">Téléphone</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Salle titulaire</th>
                <th className="px-3 py-3">Salle + Matières</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const grouped = coursParSalle(p.cours);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      {p.photo ? (
                        <img src={p.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {p.nom?.[0]}{p.prenom?.[0]}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-800">{p.nom}</td>
                    <td className="px-3 py-3 text-sm text-gray-600">{p.prenom}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full uppercase">{p.fonction}</span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600">{p.telephone}</td>
                    <td className="px-3 py-3 text-sm text-gray-600">{p.user.email}</td>
                    <td className="px-3 py-3 text-sm">
                      {p.salleTitulaire && p.salleTitulaire.length > 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 bg-green-50 text-green-600 rounded">
                          {p.salleTitulaire[0].libelle}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      {grouped.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <div className="space-y-1">
                          {grouped.map(g => (
                            <div key={g.salle} className="text-xs">
                              <span className="font-semibold text-gray-700">{g.salle}:</span>{' '}
                              <span className="text-gray-500">{g.matieres.join(', ')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEditModal(p)} className="p-1.5 text-[var(--navy)] hover:bg-[var(--accent-light)] rounded transition" title="Modifier">
                          <Edit size={15} />
                        </button>
                        {p.fonction === 'ENSEIGNANT' && (
                          p.salleTitulaire && p.salleTitulaire.length > 0 ? (
                            <button onClick={() => handleRetirerPromotion(p)} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded transition" title="Retirer promotion">
                              <Award size={15} />
                            </button>
                          ) : (
                            <button onClick={() => openPromoModal(p)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded transition" title="Promouvoir titulaire">
                              <UserCheck size={15} />
                            </button>
                          )
                        )}
                        <button onClick={() => setDeletingId(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition" title="Désactiver">
                            <UserX size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">Aucun membre du personnel trouvé.</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Modifier</h2>
              <button onClick={() => setEditModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="admin-field"><label>Nom *</label><input type="text" required value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} /></div>
                <div className="admin-field"><label>Prénom *</label><input type="text" required value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} /></div>
              </div>
              <div className="admin-field"><label>Email *</label><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="admin-field"><label>Téléphone *</label><input type="text" required value={formData.telephone} onChange={e => setFormData({ ...formData, telephone: e.target.value })} /></div>
                <div className="admin-field"><label>Fonction *</label><select required value={formData.fonction} onChange={e => setFormData({ ...formData, fonction: e.target.value })}>{FONCTIONS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="admin-field"><label>Département</label><input type="text" value={formData.departement} onChange={e => setFormData({ ...formData, departement: e.target.value })} placeholder="ex: Mathématiques" /></div>
                <div className="admin-field"><label>Ville</label><input type="text" value={formData.ville} onChange={e => setFormData({ ...formData, ville: e.target.value })} /></div>
              </div>
              <div className="admin-field"><label>Quartier</label><input type="text" value={formData.quartier} onChange={e => setFormData({ ...formData, quartier: e.target.value })} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
                <button type="submit" className="flex-1 btn-admin justify-center">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {promoPersonnel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Promouvoir titulaire</h2>
              <button onClick={() => setPromoPersonnel(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Promouvoir <strong>{promoPersonnel.nom} {promoPersonnel.prenom}</strong> comme titulaire d'une salle
            </p>
            <form onSubmit={handlePromouvoir} className="space-y-4">
              <select required className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none focus:border-[var(--accent)]"
                value={promoSalleId} onChange={e => setPromoSalleId(e.target.value)}>
                <option value="">Choisir une salle...</option>
                {sallesSansTitulaire.map(s => (
                  <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
                ))}
              </select>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setPromoPersonnel(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
                <button type="submit" className="flex-1 btn-admin justify-center">Promouvoir</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Affectation Salle + Matières Modal */}
      {showAffectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Affecter un enseignant</h2>
              <button onClick={() => { setShowAffectModal(false); setAffectData({ personnelId: '', salleId: '', matiereIds: [] }); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleAffectation} className="space-y-4">
              <select required className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none focus:border-[var(--accent)]"
                value={affectData.personnelId} onChange={e => setAffectData({ ...affectData, personnelId: e.target.value })}>
                <option value="">Choisir un enseignant...</option>
                {enseignants.map(p => (
                  <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                ))}
              </select>
              <select required className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none focus:border-[var(--accent)]"
                value={affectData.salleId} onChange={e => handleSalleChange(e.target.value)}>
                <option value="">Choisir une salle...</option>
                {salles.map(s => (
                  <option key={s.idSalle} value={s.idSalle}>{s.libelle} {s.classe ? `(${s.classe.libelle})` : ''}</option>
                ))}
              </select>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                  Matières à enseigner
                  {classeId && <span className="font-normal text-gray-400 ml-1">— {selectedSalle?.classe?.libelle || selectedSalle?.libelle || ''}</span>}
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-[var(--radius)] p-2 space-y-1">
                  {filteredMatieres.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      {classeId ? 'Aucune matière liée à cette classe' : 'Sélectionnez d\'abord une salle'}
                    </p>
                  ) : (
                    filteredMatieres.map(m => (
                      <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                        <input type="checkbox" checked={affectData.matiereIds.includes(m.id)}
                          onChange={() => handleToggleMatiere(m.id)} className="rounded border-gray-300" />
                        {m.nom} {m.code && <span className="text-gray-400 text-xs">({m.code})</span>}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAffectModal(false); setAffectData({ personnelId: '', salleId: '', matiereIds: [] }); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
                <button type="submit" className="flex-1 btn-admin justify-center">Affecter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate confirmation */}
      {deletingId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Désactiver</h2>
            <p className="text-gray-500 text-sm mb-6">Êtes-vous sûr de vouloir désactiver ce compte ?<br />L'utilisateur ne pourra plus se connecter.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition">Annuler</button>
              <button onClick={handleDeactivate} className="flex-1 btn-admin-danger justify-center py-2.5">Désactiver</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default PersonnelPage;
