import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const EpreuvePage = () => {
  const [form, setForm] = useState({
    matiere: '', classe: '', evaluation: '', annee: '2023-2024',
    sujetUrl: '', corrigeUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.corrigeUrl) return alert("Le corrigé est obligatoire !");
    console.log("Dépôt épreuve:", form);
    // Appel au epreuveService
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FileText className="text-blue-600"/> Dépôt des Épreuves</h1>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex items-start gap-3">
        <AlertCircle className="text-blue-500 mt-0.5" size={20}/>
        <p className="text-sm text-blue-700">Règle métier : Une épreuve ne peut être enregistrée qu'avec son corrigé officiel.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Matière" className="border p-3 rounded-xl" onChange={e => setForm({...form, matiere: e.target.value})}/>
          <input placeholder="Classe" className="border p-3 rounded-xl" onChange={e => setForm({...form, classe: e.target.value})}/>
        </div>
        <select className="w-full border p-3 rounded-xl" onChange={e => setForm({...form, evaluation: e.target.value})}>
          <option>Type d'évaluation...</option>
          <option>Contrôle continu</option>
          <option>Examen Trimestriel</option>
        </select>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 p-6 rounded-xl text-center">
            <Upload className="mx-auto text-gray-400 mb-2"/>
            <p className="text-sm text-gray-500">Lien du Sujet (PDF)</p>
            <input className="w-full mt-2 text-xs border p-1" placeholder="URL du fichier" onChange={e => setForm({...form, sujetUrl: e.target.value})}/>
          </div>
          <div className="border-2 border-dashed border-indigo-200 bg-indigo-50 p-6 rounded-xl text-center">
            <CheckCircle className="mx-auto text-indigo-400 mb-2"/>
            <p className="text-sm text-indigo-700 font-medium">Lien du Corrigé (Obligatoire)</p>
            <input className="w-full mt-2 text-xs border border-indigo-200 p-1" placeholder="URL du fichier" onChange={e => setForm({...form, corrigeUrl: e.target.value})}/>
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition">
          Valider le dépôt
        </button>
      </form>
    </div>
  );
};

export default EpreuvePage;