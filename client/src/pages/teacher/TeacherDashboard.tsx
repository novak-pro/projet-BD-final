import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Clock, Hash, GraduationCap } from 'lucide-react';
import api from '../../services/axiosInstance';

interface Planning {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  salle: { libelle: string } | null;
}

interface Cours {
  idCours: number;
  coefficient: number;
  matiere: { id: number; nom: string };
  classe: {
    idClasse: number;
    libelle: string;
    cycle: { libelle: string };
    _count: { students: number };
  };
  plannings: Planning[];
}

const jourLabel: Record<string, string> = {
  LUNDI: 'Lun', MARDI: 'Mar', MERCREDI: 'Mer',
  JEUDI: 'Jeu', VENDREDI: 'Ven', SAMEDI: 'Sam',
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [cours, setCours] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cours/mes-cours')
      .then(res => setCours(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement de vos cours...</div>;

  if (cours.length === 0) {
    return (
      <div className="admin-card p-10 text-center">
        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Aucun cours assigné</h2>
        <p className="text-gray-400">Vous n'avez pas encore de cours. Contactez l'administration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <BookOpen size={18} style={{ color: 'var(--navy)' }} />
            Mes Cours ({cours.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cours.map((c) => {
            const cycleLabel = c.classe.cycle?.libelle || '';
            return (
              <div
                key={c.idCours}
                onClick={() => navigate(`/teacher/cours/${c.idCours}`)}
                className="bg-white border border-gray-200 rounded-[var(--radius-lg)] p-5 shadow-sm hover:shadow-md hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--navy)]/10 flex items-center justify-center shrink-0">
                    <BookOpen size={20} className="text-[var(--navy)]" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    Coef. {c.coefficient}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-800 mb-1">{c.matiere.nom}</h3>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <GraduationCap size={14} />
                  <span>{c.classe.libelle}</span>
                  {cycleLabel && <span className="text-gray-300">· {cycleLabel}</span>}
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                  <Users size={14} />
                  <span>{c.classe._count.students} élève{c.classe._count.students !== 1 ? 's' : ''}</span>
                </div>

                {c.plannings.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Clock size={12} /> Horaires
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.plannings.slice(0, 3).map(p => (
                        <span key={p.id} className="text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                          {jourLabel[p.jour] || p.jour} {p.heureDebut}-{p.heureFin}
                          {p.salle ? ` (${p.salle.libelle})` : ''}
                        </span>
                      ))}
                      {c.plannings.length > 3 && (
                        <span className="text-xs text-gray-400">+{c.plannings.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
