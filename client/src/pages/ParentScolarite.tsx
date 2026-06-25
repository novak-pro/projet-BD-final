import React, { useState, useEffect, useRef } from 'react';
import { FileText, Camera, User, AlertCircle } from 'lucide-react';
import { enrollmentService } from '../services/enrollmentService';
import { useTranslation } from '../i18n/LanguageContext';

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
    photoURL: ''
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadRequests(); }, []);

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
      alert("Demande envoyée !");
      setPhotoPreview(null);
      setFormData({ nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '0', niveau: '', classe: '', photoURL: '' });
      loadRequests();
    } catch (err) { alert("Erreur lors de l'envoi"); }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <FileText size={18} style={{ color: 'var(--navy)' }} />
          Scolarité : Inscription de mon enfant
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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

        {/* NIVEAU */}
        <select className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm"
          value={formData.niveau}
          onChange={(e) => { setFormData({...formData, niveau: e.target.value, classe: '' }); setValidationError(''); }}>
          <option value="">Niveau (ex: Niveau 1, Niveau 2...)</option>
          {niveauOptions.map(n => (
            <option key={n.value} value={n.value}>{n.label}</option>
          ))}
        </select>

        {/* CLASSE */}
        <select className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm"
          value={formData.classe}
          onChange={(e) => { setFormData({...formData, classe: e.target.value }); setValidationError(''); }}
          disabled={!formData.niveau}>
          <option value="">Choisir une classe</option>
          {availableClasses.map(cl => (
            <option key={cl} value={cl}>{cl}</option>
          ))}
        </select>

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
