import React, { useState, useEffect } from 'react';
import api from '../services/axiosInstance';

interface FeeConfig {
  id: number;
  niveau: string;
  montantTotal: number;
  montantTranche: number;
}

const AdminFeeConfig = () => {
  const [configs, setConfigs] = useState<FeeConfig[]>([]);
  const [formData, setFormData] = useState({ niveau: '', montantTotal: '', montantTranche: '' });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await api.get('/payments/config');
      setConfigs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement configs", err);
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/payments/config', {
        ...formData,
        montantTotal: parseFloat(formData.montantTotal),
        montantTranche: parseFloat(formData.montantTranche)
      });
      alert("Tarif enregistré !");
      setFormData({ niveau: '', montantTotal: '', montantTranche: '' });
      fetchConfigs();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Configuration des Pensions par Niveau</h2>
        </div>
        <div className="admin-form">
          <div className="admin-form-row">
            <div className="admin-field">
              <label>Niveau (ex: CP1)</label>
              <input type="text" value={formData.niveau} onChange={e => setFormData({...formData, niveau: e.target.value})} />
            </div>
            <div className="admin-field">
              <label>Montant Total (FCFA)</label>
              <input type="number" value={formData.montantTotal} onChange={e => setFormData({...formData, montantTotal: e.target.value})} />
            </div>
            <div className="admin-field">
              <label>Montant d'une Tranche</label>
              <input type="number" value={formData.montantTranche} onChange={e => setFormData({...formData, montantTranche: e.target.value})} />
            </div>
          </div>
          <div>
            <button onClick={handleSave} className="btn-admin">Enregistrer</button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Tarifs enregistrés</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                <th className="text-left px-3 py-3">Niveau</th>
                <th className="text-left px-3 py-3">Total (FCFA)</th>
                <th className="text-left px-3 py-3">Par Tranche (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {configs.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium">{c.niveau}</td>
                  <td className="px-3 py-3 text-sm">{c.montantTotal.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm">{c.montantTranche.toLocaleString()}</td>
                </tr>
              ))}
              {configs.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-400">Aucun tarif configuré</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminFeeConfig;