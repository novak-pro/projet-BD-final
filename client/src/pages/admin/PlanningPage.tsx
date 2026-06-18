import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User as UserIcon } from 'lucide-react';

const PlanningPage = () => {
  const jours = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
  const [selectedClasse, setSelectedClasse] = useState("1"); // ID de la classe

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="text-purple-600"/> Emploi du Temps</h1>
        <select className="border p-2 rounded-lg" onChange={e => setSelectedClasse(e.target.value)}>
          <option value="1">Classe : CP-A</option>
          <option value="2">Classe : CE1-B</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {jours.map(jour => (
          <div key={jour} className="bg-white rounded-xl shadow-sm border min-h-[500px]">
            <div className="bg-gray-50 p-3 text-center font-bold border-b text-gray-600 rounded-t-xl">{jour}</div>
            <div className="p-2 space-y-3">
              {/* Exemple de cours */}
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r-lg">
                <p className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Clock size={12}/> 08:00 - 10:00</p>
                <p className="font-bold text-sm text-gray-800 mt-1">Mathématiques</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-2"><UserIcon size={12}/> M. Dupont</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> Salle 102</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanningPage;