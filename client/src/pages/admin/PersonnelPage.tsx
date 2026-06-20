import { useEffect, useState } from 'react';
import { personnelService, matiereService } from '../../services/apiServices';
import { Users, UserPlus, BookOpen, ShieldCheck, Plus, GraduationCap } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

// ── Composant StatCard ──
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

const PersonnelPage = () => {
  const { t } = useTranslation();
  const [personnel, setPersonnel]   = useState<any[]>([]);
  const [matieres, setMatieres]     = useState<any[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [formData, setFormData]     = useState({
    personnelId: '', idMatiere: '', idClasse: '', coefficient: 1
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        personnelService.getAll(),
        matiereService.getAll()
      ]);
      setPersonnel(pRes.data);
      setMatieres(mRes.data);
    } catch (err) {
      console.error("Erreur chargement", err);
    }
  };

  const handleAffectation = async (e: React.FormEvent) => {
    e.preventDefault();
    await personnelService.affecter(formData);
    setShowModal(false);
    loadData();
  };

  const enseignants = personnel.filter((p: any) =>
    p.fonction === 'ENSEIGNANT'
  );

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <GraduationCap size={18} style={{ color: 'var(--navy)' }} />
          Gestion du Personnel
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn-admin text-sm py-1.5 px-3"
        >
          <Plus size={16} /> Nouvelle Affectation
        </button>
      </div>

      {/* ── Stats rapides ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Personnel"
          value={personnel.length}
          icon={<Users size={22} />}
          color="bg-blue-600"
        />
        <StatCard
          title="Enseignants"
          value={enseignants.length}
          icon={<BookOpen size={22} />}
          color="bg-green-500"
        />
        <StatCard
          title="Affectations"
          value={personnel.reduce((acc: number, p: any) => acc + (p.cours?.length || 0), 0)}
          icon={<ShieldCheck size={22} />}
          color="bg-indigo-500"
        />
      </div>

      {/* ── Liste du personnel ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personnel.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-gray-400">
            Aucun membre du personnel enregistré pour le moment.
          </div>
        ) : (
          personnel.map((p: any) => (
            <div key={p.id} className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {p.nom?.[0]}{p.prenom?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{p.nom} {p.prenom}</h3>
                  <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full uppercase">
                    {p.fonction}
                  </span>
                </div>
              </div>
              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Affectations
                </p>
                {p.cours?.length > 0 ? (
                  p.cours.map((c: any) => (
                      <div key={c.idCours} className="flex justify-between text-sm bg-blue-50 p-2 rounded-[var(--radius)]">
                      <span className="font-medium text-blue-700">{c.matiere?.nom}</span>
                      <span className="text-blue-400 text-xs">Classe {c.idClasse}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Aucune affectation</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modal affectation ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Nouvelle Affectation</h2>
            <form onSubmit={handleAffectation} className="space-y-4">
              <select
                className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none focus:border-[var(--accent)]"
                onChange={(e) => setFormData({ ...formData, personnelId: e.target.value })}
              >
                <option value="">Choisir le personnel...</option>
                {enseignants.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                ))}
              </select>

              <select
                className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none focus:border-[var(--accent)]"
                onChange={(e) => setFormData({ ...formData, idMatiere: e.target.value })}
              >
                <option value="">Choisir la matière...</option>
                {matieres.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="ID de la Classe"
                className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none focus:border-[var(--accent)]"
                onChange={(e) => setFormData({ ...formData, idClasse: e.target.value })}
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-admin justify-center"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelPage;