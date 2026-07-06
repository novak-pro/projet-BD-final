import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import api from '../services/axiosInstance';
import { notifySuccess, notifyError } from '../utils/notifications';
import ConfirmModal from '../components/ConfirmModal';

interface FeeConfig {
  id: number;
  niveau: string;
  montantTotal: number;
  montantTranche: number;
}

const AdminFeeConfig = () => {
  const [configs, setConfigs] = useState<FeeConfig[]>([]);
  const [formData, setFormData] = useState({ niveau: '', montantTotal: '', montantTranche: '' });
  const [procedure, setProcedure] = useState('');
  const [procedureLoading, setProcedureLoading] = useState(false);

  useEffect(() => {
    fetchConfigs();
    loadProcedure();
  }, []);

  const loadProcedure = async () => {
    try {
      const res = await api.get('/procedure');
      if (res.data?.contenu) setProcedure(res.data.contenu);
    } catch { /* ignore */ }
  };

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
      notifySuccess("Tarif enregistré !");
      setFormData({ niveau: '', montantTotal: '', montantTranche: '' });
      fetchConfigs();
    } catch (err) {
      notifyError("Erreur lors de l'enregistrement");
    }
  };

  const saveProcedure = async () => {
    setProcedureLoading(true);
    try {
      await api.put('/procedure', { contenu: procedure });
      notifySuccess('Procédure enregistrée !');
    } catch {
      notifyError("Erreur lors de l'enregistrement de la procédure");
    } finally {
      setProcedureLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Procédure d'inscription */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <FileText size={18} style={{ color: 'var(--navy)' }} />
            Procédure d'inscription
          </h2>
          <p className="text-xs text-gray-400">Ce texte sera affiché aux parents lors de l'inscription</p>
        </div>
        <div className="admin-form">
          <textarea
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none text-sm min-h-[200px] resize-y"
            placeholder="Décrivez la procédure d'inscription (étapes, documents requis, frais...)"
          />
          <div className="mt-3">
            <button onClick={saveProcedure} disabled={procedureLoading} className="btn-admin">
              {procedureLoading ? 'Enregistrement...' : 'Enregistrer la procédure'}
            </button>
          </div>
        </div>
      </div>

      {/* Configuration des tarifs */}
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
