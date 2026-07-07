import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, XCircle, Clock, File, X, Loader2 } from 'lucide-react';
import api from '../../services/axiosInstance';
import { notifySuccess, notifyError } from '../../utils/notifications';

const EpreuvePage = () => {
  const [form, setForm] = useState({
    idMatiere: '', idClasse: '', evaluation: '', anneeAcad: '', auteur: '',
  });
  const [sujetFile, setSujetFile] = useState<File | null>(null);
  const [corrigeFile, setCorrigeFile] = useState<File | null>(null);
  const [matieres, setMatieres] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const selectedClasseId = form.idClasse ? Number(form.idClasse) : null;
  const filteredMatieres = selectedClasseId
    ? matieres.filter(m => m.classes?.some((mc: any) => Number(mc.idClasse) === selectedClasseId))
    : matieres;
  const [message, setMessage] = useState('');
  const [activeAnnee, setActiveAnnee] = useState<any>(null);
  const [trimestres, setTrimestres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const sujetRef = useRef<HTMLInputElement>(null);
  const corrigeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [mRes, cRes, aRes] = await Promise.all([
        api.get('/matieres').catch(() => ({ data: [] })),
        api.get('/enrollments/classes').catch(() => ({ data: [] })),
        api.get('/academique/annees/active').catch(() => ({ data: null }))
      ]);
      setMatieres(mRes.data);
      setClasses(cRes.data);
      const annee = aRes.data;
      if (annee) {
        setActiveAnnee(annee);
        setForm(prev => ({ ...prev, anneeAcad: annee.libelle }));
        if (annee.trimestres?.length) setTrimestres(annee.trimestres.map((t: any) => t.libelle));
      } else {
        setTrimestres(['Trimestre 1', 'Trimestre 2', 'Trimestre 3']);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sujetFile) return notifyError("Veuillez sélectionner le fichier du sujet (PDF).");
    if (!corrigeFile) return notifyError("Veuillez sélectionner le fichier du corrigé (PDF).");

    setSubmitting(true);
    const data = new FormData();
    data.append('sujet', sujetFile);
    data.append('corrige', corrigeFile);
    data.append('idMatiere', form.idMatiere);
    data.append('idClasse', form.idClasse);
    data.append('evaluation', form.evaluation);
    data.append('anneeAcad', form.anneeAcad);
    data.append('auteur', form.auteur);

    try {
      await api.post('/epreuves', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage("Épreuve déposée avec succès !");
      setForm(prev => ({ ...prev, idMatiere: '', idClasse: '', evaluation: '' }));
      setSujetFile(null);
      setCorrigeFile(null);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Erreur lors du dépôt";
      notifyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="admin-card max-w-2xl mx-auto p-10 text-center text-gray-400">Chargement...</div>;

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

      {!activeAnnee && (
        <div className="flex items-start gap-3 p-3 rounded-[var(--radius)] mb-4" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <XCircle className="mt-0.5 flex-shrink-0" size={18} color="#dc2626" />
          <p className="text-sm text-red-700">Aucune année académique active. Veuillez contacter l'administrateur.</p>
        </div>
      )}

      <div className="flex items-center gap-3 p-3 rounded-[var(--radius)] mb-4" style={{ background: activeAnnee ? '#eef2ff' : '#f9fafb', border: activeAnnee ? '1px solid #c7d2fe' : '1px solid #e5e7eb' }}>
        <Clock className="flex-shrink-0" size={18} color={activeAnnee ? '#4f46e5' : '#9ca3af'} />
        <p className="text-sm" style={{ color: activeAnnee ? '#4338ca' : '#9ca3af' }}>
          Année active : <strong>{activeAnnee?.libelle || '—'}</strong>
          {activeAnnee && ` — du ${new Date(activeAnnee.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(activeAnnee.dateFin).toLocaleDateString('fr-FR')}`}
        </p>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-[var(--radius)] mb-4" style={{ background: 'var(--accent-light)', border: '1px solid rgba(74,125,201,0.2)' }}>
        <AlertCircle className="mt-0.5 flex-shrink-0" size={18} style={{ color: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--navy)' }}>Règle métier : Une épreuve ne peut être enregistrée qu'avec son corrigé officiel.</p>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Matière</label>
            <select value={form.idMatiere} onChange={e => setForm({...form, idMatiere: e.target.value})} required>
              <option value="">Choisir...</option>
              {filteredMatieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Classe</label>
            <select value={form.idClasse} onChange={e => setForm({...form, idClasse: e.target.value, idMatiere: ''})} required>
              <option value="">Choisir...</option>
              {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
            </select>
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-field">
            <label>Évaluation</label>
            <select value={form.evaluation} onChange={e => setForm({...form, evaluation: e.target.value})} required>
              <option value="">Choisir...</option>
              {trimestres.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Année académique</label>
            <input type="text" value={form.anneeAcad} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>
        </div>
        <div className="admin-field">
          <label>Auteur</label>
          <input type="text" placeholder="Votre nom" value={form.auteur} onChange={e => setForm({...form, auteur: e.target.value})} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input ref={sujetRef} type="file" accept=".pdf,application/pdf" onChange={e => setSujetFile(e.target.files?.[0] ?? null)} className="hidden" />
            <div
              onClick={() => sujetRef.current?.click()}
              className="border-2 border-dashed rounded-[var(--radius)] p-4 text-center cursor-pointer hover:border-[var(--accent)] transition"
              style={{ borderColor: sujetFile ? 'var(--accent)' : 'var(--gray-light)' }}
            >
              {sujetFile ? (
                <div className="flex items-center gap-2 justify-center">
                  <File size={20} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-medium truncate max-w-[160px]" style={{ color: 'var(--navy)' }}>{sujetFile.name}</span>
                  <button type="button" onClick={e => { e.stopPropagation(); setSujetFile(null); if (sujetRef.current) sujetRef.current.value = ''; }} className="text-red-500 hover:text-red-700">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-2" size={24} style={{ color: 'var(--gray)' }} />
                  <p className="text-xs" style={{ color: 'var(--gray)' }}>Cliquez pour ajouter le Sujet (PDF)</p>
                </>
              )}
            </div>
          </div>
          <div>
            <input ref={corrigeRef} type="file" accept=".pdf,application/pdf" onChange={e => setCorrigeFile(e.target.files?.[0] ?? null)} className="hidden" />
            <div
              onClick={() => corrigeRef.current?.click()}
              className="border-2 border-dashed rounded-[var(--radius)] p-4 text-center cursor-pointer hover:border-[var(--accent)] transition"
              style={{ borderColor: corrigeFile ? 'var(--accent)' : 'var(--gray-light)', background: corrigeFile ? 'var(--accent-light)' : 'transparent' }}
            >
              {corrigeFile ? (
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle size={20} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-medium truncate max-w-[160px]" style={{ color: 'var(--navy)' }}>{corrigeFile.name}</span>
                  <button type="button" onClick={e => { e.stopPropagation(); setCorrigeFile(null); if (corrigeRef.current) corrigeRef.current.value = ''; }} className="text-red-500 hover:text-red-700">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-2" size={24} style={{ color: 'var(--gray)' }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--navy)' }}>Cliquez pour ajouter le Corrigé (PDF, obligatoire)</p>
                </>
              )}
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-admin w-full justify-center py-3">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
          {submitting ? 'Envoi en cours...' : 'Valider le dépôt'}
        </button>
      </form>
    </div>
  );
};

export default EpreuvePage;
