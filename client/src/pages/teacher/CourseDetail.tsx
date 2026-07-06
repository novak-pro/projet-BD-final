import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, GraduationCap, Clock, Hash } from 'lucide-react';
import api from '../../services/axiosInstance';
import GradesEntry from '../../components/teacher/GradesEntry';

interface Planning {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  salle: { libelle: string } | null;
}

interface Eleve {
  matricule: number;
  nom: string;
  prenom: string;
  photoURL: string | null;
  notes: Array<{ id: number; valeur: number; evaluation: string; matiere: { nom: string }; dateSaisie: string }>;
  evaluations: Array<{ idEval: number; note: number; appreciation: string | null; createdAt: string }>;
}

interface CoursDetail {
  idCours: number;
  coefficient: number;
  matiere: { id: number; nom: string };
  classe: {
    idClasse: number;
    libelle: string;
    cycle: { libelle: string };
    students: Eleve[];
  } | null;
  salle?: {
    libelle: string;
    classe: {
      idClasse: number;
      libelle: string;
      cycle: { libelle: string };
      students: Eleve[];
    } | null;
  } | null;
  plannings: Planning[];
}

const jourLabel: Record<string, string> = {
  LUNDI: 'Lundi', MARDI: 'Mardi', MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi', VENDREDI: 'Vendredi', SAMEDI: 'Samedi',
};

const CourseDetail = () => {
  const { idCours } = useParams();
  const navigate = useNavigate();
  const [cours, setCours] = useState<CoursDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGrades, setShowGrades] = useState(false);

  useEffect(() => {
    if (!idCours) return;
    api.get(`/cours/${idCours}`)
      .then(res => setCours(res.data))
      .catch(() => navigate('/teacher/dashboard'))
      .finally(() => setLoading(false));
  }, [idCours]);

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement...</div>;
  if (!cours) return null;

  const effectiveClasse = cours.classe ?? cours.salle?.classe ?? null;
  const students = effectiveClasse?.students || [];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/teacher/dashboard')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--navy)] transition"
      >
        <ArrowLeft size={16} /> Retour à mes cours
      </button>

      <div className="admin-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[var(--navy)]/10 flex items-center justify-center">
                <BookOpen size={20} className="text-[var(--navy)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{cours.matiere.nom}</h2>
                <p className="text-sm text-gray-500">{effectiveClasse?.libelle ?? '—'} · {effectiveClasse?.cycle?.libelle ?? ''}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Hash size={14} /> Coef. {cours.coefficient}</span>
            <span className="flex items-center gap-1"><Users size={14} /> {students.length} élève{students.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {cours.plannings.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <Clock size={14} className="text-gray-400 mt-0.5" />
            {cours.plannings.map(p => (
              <span key={p.id} className="text-xs bg-gray-50 border border-gray-100 px-2.5 py-1 rounded">
                {jourLabel[p.jour] || p.jour} {p.heureDebut}-{p.heureFin}
                {p.salle ? ` · ${p.salle.libelle}` : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Liste des élèves ({students.length})</h2>
          <button
            onClick={() => setShowGrades(!showGrades)}
            className="btn-admin text-sm"
          >
            {showGrades ? 'Voir la liste' : 'Saisir les notes'}
          </button>
        </div>

        {showGrades ? (
          <GradesEntry
            eleves={students.map(s => ({ matricule: s.matricule, nom: `${s.prenom} ${s.nom}` }))}
            matiereId={cours.matiere.id}
            classeId={effectiveClasse?.idClasse ?? 0}
            evaluation="Devoir"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                  <th className="px-3 py-3">Élève</th>
                  <th className="px-3 py-3">Dernières notes</th>
                  <th className="px-3 py-3">Évaluations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((eleve) => {
                  const lastNote = eleve.notes[0];
                  const lastEval = eleve.evaluations[0];
                  return (
                    <tr key={eleve.matricule} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            {eleve.photoURL ? (
                              <img src={eleve.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Users size={14} className="text-gray-400" />
                            )}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{eleve.prenom} {eleve.nom}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {lastNote ? (
                          <span className="font-semibold text-green-600">{lastNote.valeur.toFixed(1)}/20</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {lastEval ? (
                          <span className="font-semibold text-blue-600">{lastEval.note.toFixed(1)}/20</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {students.length === 0 && (
              <div className="p-8 text-center text-gray-400">Aucun élève dans cette classe.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
