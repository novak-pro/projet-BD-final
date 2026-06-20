import React, { useState, useEffect } from 'react';
import { ShieldAlert, Send, AlertTriangle, Search, History, Scale } from 'lucide-react';
import api from '../../services/axiosInstance';
import { useTranslation } from '../../i18n/LanguageContext';

interface Incident {
  id: number;
  type: string;
  date: string;
  gravite: string;
  pointsDeduits: number;
  commentaire: string;
  eleveId: number;
}

interface Eleve {
  matricule: number;
  nom: string;
  prenom: string;
  soldePoints: number;
}

const DisciplinePage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ eleveId: '', type: 'RETARD', gravite: 'Faible', points: 2, commentaire: '' });
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingHistory, setViewingHistory] = useState(false);

  useEffect(() => {
    loadEleves();
  }, []);

  const loadEleves = async () => {
    try {
      const res = await api.get('/students');
      setEleves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement élèves", err);
    }
  };

  const viewHistory = async (eleve: Eleve) => {
    try {
      const res = await api.get(`/discipline/eleve/${eleve.matricule}`);
      setIncidents(res.data.incidents || []);
      setSelectedEleve(eleve);
      setViewingHistory(true);
    } catch (err) {
      alert("Erreur de récupération de l'historique");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/discipline/incident', {
        eleveId: parseInt(form.eleveId),
        type: form.type,
        gravite: form.gravite,
        pointsDeduits: form.points,
        commentaire: form.commentaire,
        auteur: 'Administrateur'
      });
      alert("Incident enregistré !");
      setForm({ eleveId: '', type: 'RETARD', gravite: 'Faible', points: 2, commentaire: '' });
      loadEleves();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const filteredEleves = eleves.filter(e =>
    `${e.nom} ${e.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const elevesAlert = eleves.filter(e => (e.soldePoints ?? 20) <= 10);

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <Scale size={18} style={{ color: 'var(--navy)' }} />
          Gestion Disciplinaire
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* FORMULAIRE RAPPORT */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Send className="text-red-600"/> Rapport Disciplinaire</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Élève concerné</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                    <Search size={15} className="text-gray-400" />
                  </div>
                  <input className="flex-1 px-3 py-2 border border-gray-200 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" placeholder="Rechercher un élève..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="w-full border border-gray-200 p-2 mt-2 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" value={form.eleveId} onChange={e => setForm({...form, eleveId: e.target.value})} required>
                  <option value="">Sélectionner...</option>
                  {filteredEleves.map(e => (
                    <option key={e.matricule} value={e.matricule}>{e.nom} {e.prenom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Type d'incident</label>
                <select className="w-full border border-gray-200 p-2 mt-1 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="RETARD">Retard</option>
                  <option value="ABSENCE_INJUSTIFIEE">Absence injustifiée</option>
                  <option value="COMPORTEMENT">Indiscipline</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Gravité</label>
                  <select className="w-full border border-gray-200 p-2 mt-1 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" value={form.gravite} onChange={e => setForm({...form, gravite: e.target.value})}>
                    <option>Faible</option>
                    <option>Moyenne</option>
                    <option>Haute</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Points à retirer</label>
                  <input type="number" className="w-full border border-gray-200 p-2 mt-1 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" value={form.points} onChange={e => setForm({...form, points: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <textarea className="w-full border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" placeholder="Commentaire détaillé..." rows={4} value={form.commentaire} onChange={e => setForm({...form, commentaire: e.target.value})} required></textarea>
              <button type="submit" className="w-full btn-admin justify-center py-2.5">
                <Send size={18}/> Enregistrer
              </button>
            </form>
          </div>
        </div>

        {/* STATISTIQUES & ALERTES */}
        <div className="lg:col-span-2 space-y-6">
          {viewingHistory && selectedEleve ? (
          <div className="bg-white p-6 rounded-[var(--radius-lg)] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <History size={20} className="text-indigo-600"/>
                  Historique - {selectedEleve.nom} {selectedEleve.prenom}
                </h3>
                <div className="flex items-center gap-4">
                  <span className={`font-bold text-lg ${(selectedEleve.soldePoints ?? 20) < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    Solde: {selectedEleve.soldePoints ?? 20}/20
                  </span>
                  <button onClick={() => setViewingHistory(false)} className="text-sm text-gray-500 hover:text-gray-700">Fermer</button>
                </div>
              </div>
              {incidents.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun incident enregistré pour cet élève.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {incidents.map(inc => (
                    <div key={inc.id} className="border border-gray-100 rounded-[var(--radius)] p-4 flex justify-between items-start hover:bg-gray-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-600">-{inc.pointsDeduits} pts</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{inc.type}</span>
                          <span className={`text-xs px-2 py-1 rounded ${inc.gravite === 'Haute' ? 'bg-red-100 text-red-700' : inc.gravite === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>{inc.gravite}</span>
                        </div>
                        <p className="text-sm mt-2 text-gray-600 italic">"{inc.commentaire}"</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(inc.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="bg-red-50 border border-red-200 p-6 rounded-[var(--radius-lg)]">
                <h3 className="text-red-700 font-bold flex items-center gap-2 mb-4"><AlertTriangle size={20}/> Alertes - Seuils Critiques</h3>
                {elevesAlert.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun élève en dessous du seuil critique.</p>
                ) : (
                  elevesAlert.map(e => (
                    <div key={e.matricule} className="bg-white p-4 rounded-[var(--radius)] border border-red-100 flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                          {e.nom?.[0]}{e.prenom?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 uppercase">{e.nom} {e.prenom}</p>
                          <p className="text-xs text-red-500 font-bold">Solde actuel: {e.soldePoints ?? 20} / 20</p>
                        </div>
                      </div>
                      <button onClick={() => viewHistory(e)} className="text-sm bg-white border border-gray-200 px-3 py-1 rounded-[var(--radius)] hover:bg-gray-50">
                        Historique
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisciplinePage;