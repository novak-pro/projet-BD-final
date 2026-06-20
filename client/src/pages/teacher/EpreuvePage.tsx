import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/axiosInstance';

const EpreuvePage = () => {
  const [form, setForm] = useState({
    idMatiere: '', idClasse: '', evaluation: '', anneeAcad: '', auteur: '',
    sujetUrl: '', corrigeUrl: ''
  });
  const [matieres, setMatieres] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        api.get('/matieres'),
        api.get('/enrollments/classes')
      ]);
      setMatieres(mRes.data);
      setClasses(cRes.data);
    } catch (err) {
      console.error("Erreur chargement", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.corrigeUrl) return alert("Le corrigé est obligatoire !");
    try {
      await api.post('/epreuves', { ...form, idMatiere: Number(form.idMatiere), idClasse: Number(form.idClasse) });
      setMessage("Épreuve déposée avec succès !");
      setForm({ idMatiere: '', idClasse: '', evaluation: '', anneeAcad: '', auteur: '', sujetUrl: '', corrigeUrl: '' });
    } catch (err) {
      alert("Erreur lors du dépôt");
    }
  };

  return (
    <div className="admin-card max-w-2xl mx-auto">
      <div className="admin-card-header">
        <h2>
          <FileText size={18} style={{ color: 'var(--navy)' }} />
          Dépôt des Épreuves
        </h2>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 p-3 rounded-[var(--radius)] mb-4 text-green-700 text-sm font-medium">{message}</div>
      )}

      <div className="flex items-start gap-3 p-3 rounded-[var(--radius)] mb-4" style={{ background: 'var(--accent-light)', border: '1px solid rgba(74,125,201,0.2)' }}>
        <AlertCircle className="mt-0.5 flex-shrink-0" size={18} style={{ color: 'var(--accent)' }}/>
        <p className="text-sm" style={{ color: 'var(--navy)' }}>Règle métier : Une épreuve ne peut être enregistrée qu'avec son corrigé officiel.</p>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Matière</label>
            <select value={form.idMatiere} onChange={e => setForm({...form, idMatiere: e.target.value})} required>
              <option value="">Choisir...</option>
              {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Classe</label>
            <select value={form.idClasse} onChange={e => setForm({...form, idClasse: e.target.value})} required>
              <option value="">Choisir...</option>
              {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
            </select>
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Type d'évaluation</label>
            <select value={form.evaluation} onChange={e => setForm({...form, evaluation: e.target.value})} required>
              <option value="">Choisir...</option>
              <option value="Contrôle continu">Contrôle continu</option>
              <option value="Examen Trimestriel">Examen Trimestriel</option>
              <option value="Examen Final">Examen Final</option>
            </select>
          </div>
          <div className="admin-field">
            <label>Année académique</label>
            <input type="text" placeholder="ex: 2025-2026" value={form.anneeAcad} onChange={e => setForm({...form, anneeAcad: e.target.value})} required />
          </div>
        </div>
        <div className="admin-field">
          <label>Auteur</label>
          <input type="text" placeholder="Votre nom" value={form.auteur} onChange={e => setForm({...form, auteur: e.target.value})} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-dashed rounded-[var(--radius)] p-4 text-center" style={{ borderColor: 'var(--gray-light)' }}>
            <Upload className="mx-auto mb-2" size={24} style={{ color: 'var(--gray)' }}/>
            <p className="text-xs" style={{ color: 'var(--gray)' }}>Lien du Sujet (PDF)</p>
            <input className="w-full mt-2 text-xs border rounded-[var(--radius)] p-1" placeholder="URL" value={form.sujetUrl} onChange={e => setForm({...form, sujetUrl: e.target.value})} required />
          </div>
          <div className="border-2 border-dashed rounded-[var(--radius)] p-4 text-center" style={{ borderColor: 'var(--accent)', background: 'var(--accent-light)' }}>
            <CheckCircle className="mx-auto mb-2" size={24} style={{ color: 'var(--accent)' }}/>
            <p className="text-xs font-medium" style={{ color: 'var(--navy)' }}>Lien du Corrigé (Obligatoire)</p>
            <input className="w-full mt-2 text-xs border rounded-[var(--radius)] p-1" style={{ borderColor: 'var(--accent)' }} placeholder="URL" value={form.corrigeUrl} onChange={e => setForm({...form, corrigeUrl: e.target.value})} required />
          </div>
        </div>

        <button type="submit" className="btn-admin w-full justify-center py-3">
          Valider le dépôt
        </button>
      </form>
    </div>
  );
};

export default EpreuvePage;