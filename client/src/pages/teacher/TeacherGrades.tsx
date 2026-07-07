import { useState, useEffect } from 'react';
import { ClipboardList, BookOpen, Users, GraduationCap, ChevronRight } from 'lucide-react';
import api from '../../services/axiosInstance';
import GradesEntry from '../../components/teacher/GradesEntry';

interface ClasseInfo {
  idClasse: number;
  libelle: string;
  cycle: { libelle: string } | null;
  _count: { students: number };
  students?: Array<{ matricule: number; nom: string; prenom: string }>;
}

interface CoursItem {
  idCours: number;
  coefficient: number;
  matiere: { id: number; nom: string };
  classe: ClasseInfo | null;
  salle?: { libelle: string; classe: ClasseInfo | null } | null;
}

interface Trimestre {
  idTrimestre: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
}

const getClasse = (c: CoursItem): ClasseInfo | null => c.classe ?? c.salle?.classe ?? null;

const TeacherGrades = () => {
  const [cours, setCours] = useState<CoursItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCours, setSelectedCours] = useState<CoursItem | null>(null);
  const [trimestreId, setTrimestreId] = useState<number | ''>('');
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);

  useEffect(() => {
    api.get('/cours/mes-cours')
      .then((res: any) => {
        const data = res.data;
        setCours(Array.isArray(data) ? data : (data.cours || []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    api.get('/academique/annees/active')
      .then((res: any) => {
        const annee = res.data;
        if (annee?.trimestres) setTrimestres(annee.trimestres);
      })
      .catch(() => {});
  }, []);

  const handleSelectCours = async (c: CoursItem) => {
    const cls = getClasse(c);
    if (!cls?.students) {
      try {
        const res = await api.get(`/cours/${c.idCours}`);
        setSelectedCours(res.data);
        return;
      } catch { return; }
    }
    setSelectedCours(c);
  };

  const selectedTrimestre = trimestres.find(t => t.idTrimestre === trimestreId);

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement...</div>;

  if (cours.length === 0) {
    return (
      <div className="admin-card p-10 text-center">
        <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Aucun cours</h2>
        <p className="text-gray-400">Vous n'avez pas de cours pour saisir des notes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <ClipboardList size={18} style={{ color: 'var(--navy)' }} />
            Saisie des notes
          </h2>
        </div>

        {!selectedCours ? (
          <>
            <p className="text-sm text-gray-500 mb-4">Sélectionnez un cours pour saisir les notes :</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {cours.map(c => {
                const cls = getClasse(c);
                const afficheClasse = cls?.libelle ?? c.salle?.libelle ?? 'Salle inconnue';
                return (
                  <button
                    key={c.idCours}
                    onClick={() => handleSelectCours(c)}
                    className="text-left bg-white border border-gray-200 rounded-[var(--radius-lg)] p-4 hover:border-[var(--accent)] hover:shadow-sm transition-all flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--navy)]/10 flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-[var(--navy)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">{c.matiere.nom}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <GraduationCap size={11} /> {afficheClasse}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Users size={11} /> {cls?._count?.students ?? 0} élèves
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedCours(null)}
              className="text-sm text-[var(--navy)] hover:underline mb-4 inline-block"
            >
              ← Choisir un autre cours
            </button>

            <div className="bg-gray-50 rounded-[var(--radius)] p-4 mb-6">
              <p className="font-bold text-gray-800">{selectedCours.matiere.nom}</p>
              <p className="text-sm text-gray-500">{selectedCours.classe?.libelle ?? selectedCours.salle?.classe?.libelle ?? '—'} · {selectedCours.classe?.cycle?.libelle ?? selectedCours.salle?.classe?.cycle?.libelle ?? ''}</p>
            </div>

            <div className="admin-form-row mb-6">
              <div className="admin-field">
                <label>Trimestre</label>
                <select value={trimestreId} onChange={e => setTrimestreId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Sélectionner un trimestre</option>
                  {trimestres.map(t => (
                    <option key={t.idTrimestre} value={t.idTrimestre}>{t.libelle}</option>
                  ))}
                </select>
              </div>
            </div>

            {trimestreId && selectedTrimestre && (
              <GradesEntry
                eleves={(selectedCours.classe?.students || selectedCours.salle?.classe?.students || []).map(s => ({ matricule: s.matricule, nom: `${s.prenom} ${s.nom}` }))}
                matiereId={selectedCours.matiere.id}
                classeId={selectedCours.classe?.idClasse ?? selectedCours.salle?.classe?.idClasse ?? 0}
                evaluation={selectedTrimestre.libelle}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherGrades;
