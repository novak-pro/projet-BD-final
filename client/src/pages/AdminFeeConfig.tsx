import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminFeeConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [formData, setFormData] = useState({ niveau: '', montantTotal: '', montantTranche: '' });

  const handleSave = async () => {
    await axios.post('/api/payments/config', formData);
    alert("Tarif enregistré !");
    // Recharger la liste...
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Configuration des Pensions par Niveau</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Niveau (ex: CP1)</label>
          <input type="text" className="border p-2 rounded" onChange={e => setFormData({...formData, niveau: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium">Montant Total (FCFA)</label>
          <input type="number" className="border p-2 rounded" onChange={e => setFormData({...formData, montantTotal: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium">Montant d'une Tranche</label>
          <input type="number" className="border p-2 rounded" onChange={e => setFormData({...formData, montantTranche: e.target.value})} />
        </div>
        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Enregistrer</button>
      </div>

      {/* Tableau des tarifs existants */}
      <table className="w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 text-left">Niveau</th>
            <th className="p-3 text-left">Total</th>
            <th className="p-3 text-left">Par Tranche</th>
          </tr>
        </thead>
        <tbody>
            {/* Mapper les configs ici */}
        </tbody>
      </table>
    </div>
  );
};
export default AdminFeeConfig;