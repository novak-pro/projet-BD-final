import React, { useState } from 'react';
import { Save } from 'lucide-react';
import api from '../../services/axiosInstance';

interface Eleve {
  matricule: number;
  nom: string;
}

interface GradesEntryProps {
  eleves: Eleve[];
  matiereId: number;
  classeId: number;
  evaluation: string;
}

const GradesEntry = ({ eleves, matiereId, classeId, evaluation }: GradesEntryProps) => {
  const [grillesNotes, setGrillesNotes] = useState(
    eleves.map(e => ({ eleveId: e.matricule, nom: e.nom, valeur: '' }))
  );
  const [saving, setSaving] = useState(false);

  const handleNoteChange = (id: number, val: string) => {
    setGrillesNotes(prev => prev.map(n => n.eleveId === id ? { ...n, valeur: val } : n));
  };

  const submitNotes = async () => {
    const notes = grillesNotes.map(n => ({
      eleveId: n.eleveId,
      valeur: parseFloat(n.valeur)
    })).filter(n => !isNaN(n.valeur));

    if (notes.length === 0) return alert("Veuillez saisir au moins une note");

    setSaving(true);
    try {
      await api.post('/notes/bulk', { idMatiere: matiereId, idClasse: classeId, evaluation, notes });
      alert("Notes enregistrees avec succes !");
    } catch (err) {
      alert("Erreur lors de l'enregistrement des notes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 font-semibold">Eleve</th>
            <th className="p-4 font-semibold">Note / 20</th>
          </tr>
        </thead>
        <tbody>
          {grillesNotes.map((note) => (
            <tr key={note.eleveId} className="border-b">
              <td className="p-4">{note.nom}</td>
              <td className="p-4">
                <input 
                  type="number" 
                  max={20} min={0} step={0.5}
                  className="w-24 border rounded p-1"
                  value={note.valeur}
                  onChange={(e) => handleNoteChange(note.eleveId, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 bg-gray-50 flex justify-end">
        <button onClick={submitNotes} disabled={saving} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
          <Save size={18} /> {saving ? "Enregistrement..." : "Valider les notes"}
        </button>
      </div>
    </div>
  );
};

export default GradesEntry;
