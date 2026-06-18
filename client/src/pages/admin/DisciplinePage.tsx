import React, { useState } from 'react';
import { ShieldAlert, Send, UserCheck, AlertTriangle } from 'lucide-react';

const DisciplinePage = () => {
  const [form, setForm] = useState({ eleveId: '', type: 'Retard', gravite: 'Faible', points: 2, commentaire: '' });

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* FORMULAIRE RAPPORT */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldAlert className="text-red-600"/> Rapport Disciplinaire</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Élève concerné</label>
              <input className="w-full border p-2 mt-1 rounded-lg" placeholder="ID ou Matricule..."/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Type d'incident</label>
              <select className="w-full border p-2 mt-1 rounded-lg">
                <option>Retard</option>
                <option>Absence injustifiée</option>
                <option>Indiscipline</option>
                <option>Bagarre</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Gravité</label>
                <select className="w-full border p-2 mt-1 rounded-lg">
                  <option>Faible</option>
                  <option>Moyenne</option>
                  <option>Haute</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Points à retirer</label>
                <input type="number" className="w-full border p-2 mt-1 rounded-lg" defaultValue={2}/>
              </div>
            </div>
            <textarea className="w-full border p-2 rounded-lg" placeholder="Commentaire détaillé..." rows={4}></textarea>
            <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700">
              <Send size={18}/> Enregistrer et Notifier
            </button>
          </div>
        </div>
      </div>

      {/* STATISTIQUES & ALERTES */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
          <h3 className="text-red-700 font-bold flex items-center gap-2 mb-4"><AlertTriangle size={20}/> Alertes - Seuils Critiques</h3>
          <div className="bg-white p-4 rounded-xl border border-red-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">JD</div>
              <div>
                <p className="font-bold text-gray-800 uppercase">John DOE</p>
                <p className="text-xs text-red-500 font-bold">Solde actuel: 08 / 20</p>
              </div>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">Convoquer Parents</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplinePage;