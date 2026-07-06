import React, { useState, useEffect, useRef } from 'react';
import { FileText, Camera, User, AlertCircle, AlertTriangle, X, Upload } from 'lucide-react';
import { enrollmentService } from '../services/enrollmentService';
import { useTranslation } from '../i18n/LanguageContext';
import api from '../services/axiosInstance';
import { notifySuccess, notifyError } from '../utils/notifications';

const niveauOptions = [
  { value: 'Niveau 1', label: 'Niveau 1' },
  { value: 'Niveau 2', label: 'Niveau 2' },
  { value: 'Niveau 3', label: 'Niveau 3' },
];

const classeOptions = ['SIL', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];

const niveauClasseMap: Record<string, string[]> = {
  'Niveau 1': ['SIL', 'CP'],
  'Niveau 2': ['CE1', 'CE2'],
  'Niveau 3': ['CM1', 'CM2'],
};

const ParentScolarite = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '0', niveau: '', classe: '',
    photoURL: '', recuPDF: '', modePaiement: ''
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [recuPreview, setRecuPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [procedure, setProcedure] = useState<string>('');
  const [showProcedure, setShowProcedure] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recuRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadRequests(); loadProcedure(); }, []);

  const loadProcedure = async () => {
    try {
      const res = await api.get('/procedure');
      if (res.data?.contenu) setProcedure(res.data.contenu);
    } catch { /* ignore */ }
  };

  const loadRequests = async () => {
    const res = await enrollmentService.getAll();
    setRequests(res.data);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      setFormData(prev => ({ ...prev, photoURL: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleRecuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setRecuPreview(file.name);
      setFormData(prev => ({ ...prev, recuPDF: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const availableClasses = formData.niveau ? niveauClasseMap[formData.niveau] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (formData.niveau && formData.classe) {
      const allowed = niveauClasseMap[formData.niveau];
      if (allowed && !allowed.includes(formData.classe)) {
        setValidationError(`La classe "${formData.classe}" ne correspond pas au ${formData.niveau}. Les classes autorisées sont : ${allowed.join(', ')}.`);
        return;
      }
    }

    try {
      await enrollmentService.submit(formData);
      notifySuccess("Demande envoyée !");
      setPhotoPreview(null);
      setRecuPreview(null);
      setFormData({ nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '0', niveau: '', classe: '', photoURL: '', recuPDF: '', modePaiement: '' });
      loadRequests();
    } catch (err) { notifyError("Erreur lors de l'envoi"); }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <FileText size={18} style={{ color: 'var(--navy)' }} />
          Scolarité : Inscription de mon enfant
        </h2>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setShowProcedure(true)}
          className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors shrink-0 self-start"
          title="Voir la procédure d'inscription"
        >
          <AlertTriangle size={16} />
          Procédure
        </button>
      </div>

      {/* Modal procédure */}
      {showProcedure && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowProcedure(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Procédure d'inscription</h3>
              <button onClick={() => setShowProcedure(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {procedure || "Aucune procédure définie par l'administration."}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-4">
        <div className="col-span-2 flex items-center gap-4 mb-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-gray-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--navy)] text-white rounded-full flex items-center justify-center shadow-md hover:brightness-110 transition-all"
            >
              <Camera size={10} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
          <p className="text-xs text-gray-400">Ajouter une photo de votre enfant</p>
        </div>

        <input type="text" placeholder="Nom de l'enfant" className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm"
          value={formData.nom}
          onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
        <input type="text" placeholder="Prénom de l'enfant" className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm"
          value={formData.prenom}
          onChange={(e) => setFormData({...formData, prenom: e.target.value})} required />
        <input type="date" className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm"
          value={formData.dateNaissance}
          onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})} required />
        <input type="text" placeholder="Lieu de naissance" className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm"
          value={formData.lieuNaissance}
          onChange={(e) => setFormData({...formData, lieuNaissance: e.target.value})} required />
        <select className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm" value={formData.sexe}
          onChange={(e) => setFormData({...formData, sexe: e.target.value})}>
          <option value="0">Fille</option>
          <option value="1">Garçon</option>
        </select>

        <select className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm"
          value={formData.niveau}
          onChange={(e) => { setFormData({...formData, niveau: e.target.value, classe: '' }); setValidationError(''); }}>
          <option value="">Niveau (ex: Niveau 1, Niveau 2...)</option>
          {niveauOptions.map(n => (
            <option key={n.value} value={n.value}>{n.label}</option>
          ))}
        </select>

        <select className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm"
          value={formData.classe}
          onChange={(e) => { setFormData({...formData, classe: e.target.value }); setValidationError(''); }}
          disabled={!formData.niveau}>
          <option value="">Choisir une classe</option>
          {availableClasses.map(cl => (
            <option key={cl} value={cl}>{cl}</option>
          ))}
        </select>

        {/* Reçu PDF */}
        <div className="col-span-2 flex items-center gap-3 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-[var(--radius)]">
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-600 mb-1">Reçu de paiement (facture)</p>
            {recuPreview ? (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Upload size={12} /> {recuPreview}
              </p>
            ) : (
              <p className="text-xs text-gray-400">Téléchargez le reçu de paiement (PDF ou image)</p>
            )}
          </div>
          <button type="button" onClick={() => recuRef.current?.click()}
            className="text-xs bg-[var(--navy)] text-white px-3 py-1.5 rounded-lg hover:brightness-110 transition-all">
            {recuPreview ? 'Changer' : 'Parcourir'}
          </button>
          <input ref={recuRef} type="file" accept=".pdf,image/*" onChange={handleRecuChange} className="hidden" />
        </div>

        {/* Mode de paiement */}
        <div className="col-span-2">
          <select className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm w-full"
            value={formData.modePaiement}
            onChange={(e) => setFormData({...formData, modePaiement: e.target.value})}>
            <option value="">Mode de paiement</option>
            <option value="CASH">Paiement par cash à l'école</option>
            <option value="VIREMENT">Virement bancaire</option>
          </select>
        </div>

        {validationError && (
          <div className="col-span-2 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-[var(--radius)] text-sm text-red-700">
            <AlertCircle size={16} />
            {validationError}
          </div>
        )}

        <button className="col-span-2 btn-admin justify-center">
          Soumettre la demande d'inscription
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Mes demandes en cours</h2>
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div key={req.id} className="border border-gray-100 p-4 rounded-[var(--radius)] flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                {req.photoURL ? (
                  <img src={req.photoURL} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={16} className="text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-bold">{req.prenom} {req.nom}</p>
                  <p className="text-sm text-gray-500">
                    {req.niveau}{req.classe ? ` — ${req.classe}` : ''} — Soumis le {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                  {req.modePaiement && (
                    <p className="text-xs text-gray-400">Paiement : {req.modePaiement === 'CASH' ? 'Cash école' : 'Virement'}</p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                req.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' : 
                req.status === 'APPROVED' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentScolarite;
