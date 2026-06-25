import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import api from '../../services/axiosInstance';

interface PlanningItem {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  salle: { libelle: string } | null;
  cours: {
    idCours: number;
    matiere: { nom: string };
    classe: { libelle: string };
  };
}

const jours = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
const jourLabel: Record<string, string> = {
  LUNDI: 'Lundi', MARDI: 'Mardi', MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi', VENDREDI: 'Vendredi', SAMEDI: 'Samedi',
};

const couleurs: string[] = [
  'bg-blue-100 border-blue-200 text-blue-700',
  'bg-green-100 border-green-200 text-green-700',
  'bg-purple-100 border-purple-200 text-purple-700',
  'bg-orange-100 border-orange-200 text-orange-700',
  'bg-pink-100 border-pink-200 text-pink-700',
  'bg-teal-100 border-teal-200 text-teal-700',
];

const matiereCouleur = new Map<string, string>();

const TeacherPlanning = () => {
  const [plannings, setPlannings] = useState<PlanningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cours/mes-cours')
      .then((res: any) => {
        const all: PlanningItem[] = [];
        for (const c of res.data) {
          if (c.plannings) {
            for (const p of c.plannings) {
              all.push({ ...p, cours: { idCours: c.idCours, matiere: c.matiere, classe: c.classe } });
            }
          }
        }
        all.sort((a, b) => {
          const oa = jours.indexOf(a.jour), ob = jours.indexOf(b.jour);
          if (oa !== ob) return oa - ob;
          return a.heureDebut.localeCompare(b.heureDebut);
        });

        let idx = 0;
        for (const p of all) {
          if (!matiereCouleur.has(p.cours.matiere.nom)) {
            matiereCouleur.set(p.cours.matiere.nom, couleurs[idx % couleurs.length]);
            idx++;
          }
        }

        setPlannings(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement...</div>;

  if (plannings.length === 0) {
    return (
      <div className="admin-card p-10 text-center">
        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Aucun créneau</h2>
        <p className="text-gray-400">Votre emploi du temps n'a pas encore été défini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <Calendar size={18} style={{ color: 'var(--navy)' }} />
            Mon Emploi du Temps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {jours.map(jour => {
            const slots = plannings.filter(p => p.jour === jour);
            return (
              <div key={jour} className="bg-gray-50 rounded-[var(--radius-lg)] border border-gray-100 overflow-hidden">
                <div className="bg-[var(--navy)] text-white text-center py-2 px-3 text-sm font-bold">
                  {jourLabel[jour]}
                </div>
                <div className="p-2 space-y-2 min-h-[200px]">
                  {slots.length === 0 ? (
                    <p className="text-xs text-gray-300 text-center py-4">—</p>
                  ) : (
                    slots.map(p => (
                      <div key={p.id} className={`p-2.5 rounded-[var(--radius)] border text-xs ${matiereCouleur.get(p.cours.matiere.nom) || 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                        <div className="flex items-center gap-1 font-semibold mb-1">
                          <Clock size={10} />
                          <span>{p.heureDebut}-{p.heureFin}</span>
                        </div>
                        <p className="font-bold text-sm">{p.cours.matiere.nom}</p>
                        <p className="opacity-75">{p.cours.classe.libelle}</p>
                        {p.salle && (
                          <div className="flex items-center gap-1 mt-1 opacity-75">
                            <MapPin size={10} />
                            <span>{p.salle.libelle}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherPlanning;
