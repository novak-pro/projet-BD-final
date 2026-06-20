import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';

interface Child {
  matricule: number;
  nom: string;
  prenom: string;
  niveau: string;
}

interface Incident {
  id: number;
  type: string;
  date: string;
  gravite: string;
  pointsDeduits: number;
  commentaire: string;
}

const ParentDiscipline = () => {
  const { t } = useTranslation();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [soldePoints, setSoldePoints] = useState(20);

  useEffect(() => {
    api.get('/enrollments/my-children').then(res => setChildren(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    api.get(`/discipline/eleve/${selectedChild}`)
      .then(res => {
        setIncidents(res.data.incidents || []);
        setSoldePoints(res.data.soldePoints ?? 20);
      })
      .catch(() => {});
  }, [selectedChild]);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <ShieldCheck size={18} style={{ color: 'var(--navy)' }} />
          Discipline
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[var(--radius-lg)] border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Solde de conduite</h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--navy)' }}>{soldePoints} / 20</p>
            </div>
            <div className={`h-4 w-4 rounded-full ${soldePoints < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          </div>

          <div className="lg:col-span-2 bg-white rounded-[var(--radius-lg)] border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold">Historique des incidents</div>
            {incidents.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">Aucun incident signale pour cet enfant.</div>
            ) : (
              incidents.map(inc => (
                <div key={inc.id} className="p-4 border-b last:border-0 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-red-600">-{inc.pointsDeduits} points</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${inc.gravite === 'Haute' ? 'bg-red-100 text-red-700' : inc.gravite === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>{inc.gravite}</span>
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

      {incidents.length > 0 && soldePoints <= 10 && (
        <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-[var(--radius)] flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={20} />
          <p className="text-red-700 text-sm font-medium">Alerte : le solde de conduite de votre enfant est critique ({soldePoints}/20).</p>
        </div>
      )}
    </div>
  );
};

export default ParentDiscipline;
