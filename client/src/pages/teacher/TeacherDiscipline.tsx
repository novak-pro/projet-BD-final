import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import api from '../../services/axiosInstance';

interface EleveItem {
  matricule: number;
  nom: string;
  prenom: string;
}

const TeacherDiscipline = () => {
  const [eleves, setEleves] = useState<EleveItem[]>([]);
  const [form, setForm] = useState({
    eleveId: '', type: 'RETARD', gravite: 'Faible', pointsDeduits: '1', commentaire: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/cours/mes-eleves')
      .then((res: any) => setEleves(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eleveId) return alert("Sélectionnez un élève");
    try {
      await api.post('/discipline/incident', {
        eleveId: parseInt(form.eleveId),
        type: form.type,
        gravite: form.gravite,
        pointsDeduits: parseInt(form.pointsDeduits) || 0,
        commentaire: form.commentaire,
        auteur: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').nom || 'Enseignant' : 'Enseignant',
      });
      setMessage("Incident signalé !");
      setForm({ eleveId: '', type: 'RETARD', gravite: 'Faible', pointsDeduits: '1', commentaire: '' });
    } catch {
      alert("Erreur lors du signalement");
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-card max-w-2xl">
        <div className="admin-card-header">
          <h2>
            <ShieldAlert size={18} style={{ color: 'var(--navy)' }} />
            Signaler un incident
          </h2>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 p-3 rounded mb-4 text-green-700 text-sm">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-field">
            <label>Élève</label>
            <select value={form.eleveId} onChange={e => setForm({...form, eleveId: e.target.value})} required>
              <option value="">Sélectionner un élève</option>
              {eleves.map(e => (
                <option key={e.matricule} value={e.matricule}>{e.prenom} {e.nom}</option>
              ))}
            </select>
          </div>
          <div className="admin-form-row">
            <div className="admin-field">
              <label>Type d'incident</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="RETARD">Retard</option>
                <option value="ABSENCE_INJUSTIFIEE">Absence injustifiée</option>
                <option value="COMPORTEMENT">Comportement</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Gravité</label>
              <select value={form.gravite} onChange={e => setForm({...form, gravite: e.target.value})}>
                <option value="Faible">Faible</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-field">
              <label>Points à déduire</label>
              <input type="number" min={0} max={20} value={form.pointsDeduits}
                onChange={e => setForm({...form, pointsDeduits: e.target.value})} />
            </div>
          </div>
          <div className="admin-field">
            <label>Commentaire</label>
            <textarea value={form.commentaire} onChange={e => setForm({...form, commentaire: e.target.value})}
              required className="border border-gray-200 p-3 rounded w-full text-sm" rows={3} />
          </div>
          <button className="btn-admin justify-center">Signaler l'incident</button>
        </form>
      </div>
    </div>
  );
};

export default TeacherDiscipline;
