import React, { useState, useEffect } from 'react';
import { FileBarChart } from 'lucide-react';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';

interface Child {
  matricule: number;
  nom: string;
  prenom: string;
  niveau: string;
}

interface Note {
  valeur: number;
  evaluation: string;
  matiere: { id: number; nom: string };
}

interface NotesEleve {
  matricule: number;
  nom: string;
  prenom: string;
  notes: Note[];
}

const ParentBulletins = () => {
  const { t } = useTranslation();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [evaluation, setEvaluation] = useState('Controle continu');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/enrollments/my-children').then(res => setChildren(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    api.get(`/notes/eleve/${selectedChild}?evaluation=${encodeURIComponent(evaluation)}`)
      .then(res => setNotes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [selectedChild, evaluation]);

  const moyenne = notes.length > 0 ? notes.reduce((sum, n) => sum + n.valeur, 0) / notes.length : 0;

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <FileBarChart size={18} style={{ color: 'var(--navy)' }} />
          Bulletins
        </h2>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Mon enfant</label>
          <select className="w-full max-w-md border border-gray-200 p-3 rounded-[var(--radius)] outline-none text-sm" value={selectedChild} onChange={e => setSelectedChild(e.target.value)}>
            <option value="">Selectionner...</option>
            {children.map(c => <option key={c.matricule} value={c.matricule}>{c.prenom} {c.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Evaluation</label>
          <select className="border border-gray-200 p-3 rounded-[var(--radius)] outline-none text-sm" value={evaluation} onChange={e => setEvaluation(e.target.value)}>
            <option value="Controle continu">Controle continu</option>
            <option value="Examen Trimestriel">Examen Trimestriel</option>
            <option value="Examen Final">Examen Final</option>
          </select>
        </div>
      </div>

      {selectedChild && (
        <div className="bg-white rounded-[var(--radius-lg)] border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <span className="font-bold">Notes de {children.find(c => String(c.matricule) === selectedChild)?.prenom}</span>
            <span className="text-lg font-bold" style={{ color: 'var(--navy)' }}>Moyenne: {moyenne.toFixed(2)} / 20</span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : notes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Aucune note disponible pour cette periode.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                  <th className="p-4">Matiere</th>
                  <th className="p-4">Note / 20</th>
                  <th className="p-4">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {notes.map((n, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{n.matiere?.nom}</td>
                    <td className="p-4"><span className="font-bold">{n.valeur.toFixed(2)}</span></td>
                    <td className="p-4 text-sm text-gray-500">{n.evaluation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentBulletins;
