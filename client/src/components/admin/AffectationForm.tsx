import React, { useState } from 'react';
import axios from 'axios';
const AffectationForm = ({ personels, matieres, classes }) => {
  const [formData, setFormData] = useState({
    personnelId: '',
    idMatiere: '',
    idClasse: '',
    coefficient: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/personnel/affecter', formData);
      alert("Enseignant affecté avec succès !");
    } catch (err) {
      alert("Erreur lors de l'affectation");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
      <h3 className="text-lg font-bold">Affectation des matières</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Enseignant</label>
        <select 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          onChange={(e) => setFormData({...formData, personnelId: e.target.value})}
        >
          <option>Choisir un enseignant...</option>
          {personels.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Matière</label>
          <select 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onChange={(e) => setFormData({...formData, idMatiere: e.target.value})}
          >
             <option>Choisir...</option>
             {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Classe</label>
          <select 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onChange={(e) => setFormData({...formData, idClasse: e.target.value})}
          >
             <option>Choisir...</option>
             {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
          </select>
        </div>
      </div>

      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
        Valider l'affectation
      </button>
    </form>
  );
};