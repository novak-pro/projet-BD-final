import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import api from '../../services/axiosInstance';
import { notifySuccess, notifyError } from '../../utils/notifications';
import SubmitBtn from '../../components/SubmitBtn';
import Spinner from '../../components/Spinner';

interface EleveItem {
  matricule: number;
  nom: string;
  prenom: string;
}

interface TypeInfra {
  id: number;
  libelle: string;
}

const TeacherDiscipline = () => {
  const [eleves, setEleves] = useState<EleveItem[]>([]);
  const [types, setTypes] = useState<TypeInfra[]>([]);
  const [form, setForm] = useState({
    eleveId: '', type: '', gravite: 'Faible', pointsDeduits: '1', commentaire: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/cours/mes-eleves').then((res: any) => setEleves(res.data)).catch(() => {}),
      api.get('/discipline/types').then((res: any) => setTypes(Array.isArray(res.data) ? res.data : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eleveId) return notifyError("Sélectionnez un élève");
    setSubmitting(true);
    try {
      const userData = (() => {
        try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return u.nom || u.prenom || 'Enseignant'; }
        catch { return 'Enseignant'; }
      })();
      await api.post('/discipline/incident', {
        eleveId: parseInt(form.eleveId),
        type: form.type || 'AUTRE',
        gravite: form.gravite,
        pointsDeduits: parseInt(form.pointsDeduits) || 0,
        commentaire: form.commentaire,
        auteur: userData,
      });
      setMessage("Incident signalé !");
      setForm({ eleveId: '', type: '', gravite: 'Faible', pointsDeduits: '1', commentaire: '' });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.response?.data?.error || err?.message || '';
      notifyError("Erreur: " + detail);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner text="Chargement des données..." />;

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
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} required>
                <option value="">Choisir...</option>
                {types.map(t => (
                  <option key={t.id} value={t.libelle}>{t.libelle}</option>
                ))}
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
          <SubmitBtn loading={submitting} text="Signaler l'incident" loadingText="Envoi..." />
        </form>
      </div>
    </div>
  );
};

export default TeacherDiscipline;
