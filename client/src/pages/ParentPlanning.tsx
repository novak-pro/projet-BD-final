import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';

interface Child {
  matricule: number;
  nom: string;
  prenom: string;
  niveau: string;
}

interface Seance {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  salle?: { nom: string };
  matiere?: { nom: string };
}

const ParentPlanning = () => {
  const { t } = useTranslation();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [planning, setPlanning] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/enrollments/my-children').then(res => setChildren(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    api.get(`/planning/eleve/${selectedChild}`)
      .then(res => setPlanning(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPlanning([]))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <Calendar size={18} style={{ color: 'var(--navy)' }} />
          Emploi du Temps
        </h2>
      </div>

      <div className="mb-6">
        <label className="text-sm font-bold text-gray-500 uppercase block mb-2">Mon enfant</label>
        <select className="w-full max-w-md border border-gray-200 p-3 rounded-[var(--radius)] outline-none text-sm" value={selectedChild} onChange={e => setSelectedChild(e.target.value)}>
          <option value="">Selectionner un enfant...</option>
          {children.map(c => <option key={c.matricule} value={c.matricule}>{c.prenom} {c.nom}</option>)}
        </select>
      </div>

      {selectedChild && (
        <div className="bg-white rounded-[var(--radius-lg)] border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : planning.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Aucun emploi du temps disponible.</div>
          ) : (
            <div className="grid grid-cols-6 gap-px bg-gray-200">
              <div className="bg-gray-50 p-3 font-bold text-sm text-gray-500">Horaire</div>
              {jours.map(j => <div key={j} className="bg-gray-50 p-3 font-bold text-sm text-gray-500 text-center">{j}</div>)}
              {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(heure => (
                <React.Fragment key={heure}>
                  <div className="bg-white p-3 text-xs text-gray-400 flex items-center gap-1 border-t">
                    <Clock size={12}/> {heure}
                  </div>
                  {jours.map(j => {
                    const seance = planning.find(s => s.jour === j && s.heureDebut === heure);
                    return (
                      <div key={`${j}-${heure}`} className="bg-white p-2 text-xs border-t min-h-[60px]">
                        {seance && (
                          <div className="rounded-[var(--radius)] p-2 h-full" style={{ background: 'var(--accent-light)' }}>
                            <p className="font-bold text-[11px]" style={{ color: 'var(--navy)' }}>{seance.matiere?.nom}</p>
                            <p className="text-[10px] text-gray-500">{seance.salle?.nom}</p>
                            <p className="text-[10px] text-gray-400">{seance.heureDebut}-{seance.heureFin}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentPlanning;
