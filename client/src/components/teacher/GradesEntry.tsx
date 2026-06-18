// components/teacher/GradesEntry.tsx
import React, { useState } from 'react';
import { Save } from 'lucide-react';

const GradesEntry = ({ eleves, matiereId }) => {
  const [grillesNotes, setGrillesNotes] = useState(
    eleves.map(e => ({ eleveId: e.matricule, nom: e.nom, valeur: '' }))
  );

  const handleNoteChange = (id, val) => {
    setGrillesNotes(prev => prev.map(n => n.eleveId === id ? { ...n, valeur: val } : n));
  };

  const submitNotes = async () => {
    // Appel API vers enregistrerNotesGroupees
    console.log("Envoi des notes :", grillesNotes);
  };

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 font-semibold">Élève</th>
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
                  max="20" min="0"
                  className="w-20 border rounded p-1"
                  value={note.valeur}
                  onChange={(e) => handleNoteChange(note.eleveId, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 bg-gray-50 flex justify-end">
        <button onClick={submitNotes} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          <Save size={18} /> Valider les notes
        </button>
      </div>
    </div>
  );
};