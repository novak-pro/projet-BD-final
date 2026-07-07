import React, { useState, useEffect, useRef } from 'react';
import { FileText, Camera, User, AlertCircle, AlertTriangle, X, Upload, Info, Calendar } from 'lucide-react';
import { enrollmentService } from '../services/enrollmentService';
import { useTranslation } from '../i18n/LanguageContext';
import api from '../services/axiosInstance';
import { notifySuccess, notifyError } from '../utils/notifications';
import SubmitBtn from '../components/SubmitBtn';

const ParentScolarite = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '0', niveau: '', classe: '',
    photoURL: '', recuPDF: '', modePaiement: ''
  });
  const [cycles, setCycles] = useState<{ idCycle: number; libelle: string }[]>([]);
  const [classes, setClasses] = useState<{ idClasse: number; libelle: string; cycle: { idCycle: number; libelle: string } | null }[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [recuPreview, setRecuPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [procedure, setProcedure] = useState<string>('');
  const [showProcedure, setShowProcedure] = useState(false);
  const [scolarites, setScolarites] = useState<any[]>([]);
  const [showScolariteInfo, setShowScolariteInfo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recuRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadRequests(); loadProcedure(); loadCycles(); loadClasses(); loadScolarites(); }, []);

  const loadProcedure = async () => {
    try {
      const res = await api.get('/procedure');
      if (res.data?.contenu) setProcedure(res.data.contenu);
    } catch { /* ignore */ }
  };

  const loadCycles = async () => {
    try {
      const res = await api.get('/enrollments/cycles');
      setCycles(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ }
  };

  const loadScolarites = async () => {
    try {
      const res = await api.get('/scolarite');
      setScolarites(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ }
  };

  const loadClasses = async () => {
    try {
      const res = await api.get('/enrollments/classes');
      setClasses(Array.isArray(res.data) ? res.data : []);
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

  const selectedCycleId = formData.niveau ? Number(formData.niveau) : null;
  const availableClasses = selectedCycleId
    ? classes.filter(c => c.cycle?.idCycle === selectedCycleId)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSubmitting(true);

    const selectedCycle = cycles.find(c => c.idCycle === selectedCycleId);
    const selectedClasse = classes.find(c => c.idClasse === Number(formData.classe));

    try {
      await enrollmentService.submit({
        ...formData,
        niveau: selectedCycle?.libelle || '',
        classe: selectedClasse?.libelle || '',
      });
      notifySuccess("Demande envoyée !");
      setPhotoPreview(null);
      setRecuPreview(null);
      setFormData({ nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '0', niveau: '', classe: '', photoURL: '', recuPDF: '', modePaiement: '' });
      loadRequests();
    } catch (err) { notifyError("Erreur lors de l'envoi"); }
    finally { setSubmitting(false); }
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
        <button
          type="button"
          onClick={() => setShowScolariteInfo(true)}
          className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shrink-0 self-start"
          title="Voir les informations sur la scolarité"
        >
          <Info size={16} />
          Info Scolarité
        </button>
      </div>

      {/* Modal scolarité */}
      {showScolariteInfo && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowScolariteInfo(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Informations Scolarité</h3>
              <button onClick={() => setShowScolariteInfo(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            {scolarites.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune information disponible.</p>
            ) : (
              <div className="space-y-4">
                {scolarites.map((s: any) => (
                  <div key={s.id} className="border border-gray-100 rounded-[var(--radius)] p-4 bg-gray-50">
                    <h4 className="font-bold text-sm text-[var(--navy)] mb-2">{s.classe?.libelle || `Classe #${s.classeId}`}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Frais d'inscription</div>
                      <div className="font-semibold">{Number(s.montantInscription).toLocaleString()} FCFA</div>
                      <div className="text-gray-500">Pension annuelle</div>
                      <div className="font-semibold">{Number(s.montantPension).toLocaleString()} FCFA</div>
                      <div className="text-gray-500">Tranches</div>
                      <div className="font-semibold">{s.nombreTranches}x</div>
                    </div>
                    {s.tranches?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-600 mb-2">Échéancier</p>
                        {s.tranches.map((t: any) => (
                          <div key={t.id} className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                            <Calendar size={12} />
                            <span className="font-medium">{t.libelle} :</span>
                            <span>{Number(t.montant).toLocaleString()} FCFA</span>
                            <span className="text-gray-400">— {new Date(t.dateLimite).toLocaleDateString('fr-FR')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
          <option value="">Cycle</option>
          {cycles.map(c => (
            <option key={c.idCycle} value={c.idCycle}>{c.libelle}</option>
          ))}
        </select>

        <select className="border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm"
          value={formData.classe}
          onChange={(e) => { setFormData({...formData, classe: e.target.value }); setValidationError(''); }}
          disabled={!formData.niveau}>
          <option value="">Choisir une classe</option>
          {availableClasses.map(cl => (
            <option key={cl.idClasse} value={cl.idClasse}>{cl.libelle}</option>
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

        <SubmitBtn loading={submitting} text="Soumettre la demande d'inscription" loadingText="Envoi..." className="col-span-2 btn-admin justify-center" />
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
