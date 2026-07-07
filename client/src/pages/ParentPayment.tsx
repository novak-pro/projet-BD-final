import { useState, useEffect } from 'react';
import { CreditCard, Clock, Upload, Calendar } from 'lucide-react';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';
import { notifySuccess, notifyError } from '../utils/notifications';
import SubmitBtn from '../components/SubmitBtn';

interface Child {
  matricule: number;
  nom: string;
  prenom: string;
  niveau: string;
  classroomId: number | null;
}

interface Tranche {
  id: number;
  libelle: string;
  montant: number;
  dateLimite: string;
}

interface Scolarite {
  montantInscription: number;
  montantPension: number;
  nombreTranches: number;
  tranches: Tranche[];
}

interface Payment {
  id: number;
  montant: number;
  methode: string;
  modePaiement: string | null;
  recuPDF: string | null;
  status: 'VALIDATED' | 'PENDING' | 'REJECTED';
  createdAt: string;
  transactionRef: string;
  eleve: { nom: string; prenom: string };
}

const ParentPayment = () => {
  const { t } = useTranslation();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [scolarite, setScolarite] = useState<Scolarite | null>(null);
  const [scolariteError, setScolariteError] = useState('');
  const [selectedTranches, setSelectedTranches] = useState<number>(1);
  const [modePaiement, setModePaiement] = useState<string>('');
  const [recuPDF, setRecuPDF] = useState<string>('');
  const [recuName, setRecuName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    api.get('/enrollments/my-children')
      .then((res) => setChildren(res.data))
      .catch(() => console.error('Impossible de charger les enfants'));
  }, []);

  useEffect(() => {
    if (!selectedChild) { setScolarite(null); setScolariteError(''); return; }
    setScolarite(null);
    setScolariteError('');
    setSelectedTranches(1);
    const child = children.find(c => String(c.matricule) === selectedChild);
    if (!child?.classroomId) {
      setScolariteError("Cet enfant n'a pas de classe assignée. Contactez l'administration.");
      return;
    }
    api.get(`/scolarite/classe/${child.classroomId}`)
      .then((res) => setScolarite(res.data))
      .catch(() => setScolariteError("Aucune scolarité configurée pour la classe de cet enfant."));
  }, [selectedChild, children]);

  useEffect(() => {
    setLoadingHistory(true);
    api.get('/payments/my-payments')
      .then((res) => setMyPayments(res.data))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const pensionParTranche = scolarite ? Math.round(scolarite.montantPension / scolarite.nombreTranches) : 0;
  const totalAmount = pensionParTranche * selectedTranches;

  const resetForm = () => {
    setSelectedChild('');
    setScolarite(null);
    setScolariteError('');
    setSelectedTranches(1);
    setModePaiement('');
    setRecuPDF('');
    setRecuName('');
  };

  const handleRecuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRecuName(file.name);
      setRecuPDF(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modePaiement) { notifyError('Veuillez sélectionner un mode de paiement'); return; }
    if (!recuPDF) { notifyError('Veuillez joindre le reçu de paiement'); return; }

    setSubmitting(true);
    try {
      await api.post('/payments/initiate', {
        eleveId: selectedChild,
        nombreTranches: selectedTranches,
        methode: 'CARTE_BANCAIRE',
        transactionRef: `OFFLINE-${Date.now()}`,
        montant: totalAmount,
        modePaiement,
        recuPDF,
      });
      notifySuccess('Demande de paiement envoyée avec succès !');
      resetForm();
    } catch {
      notifyError('Erreur lors de l\'envoi du paiement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <CreditCard size={18} style={{ color: 'var(--navy)' }} />
            Paiement de la Pension
          </h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.88rem' }}>Payez à l'école ou par virement, puis joignez votre reçu</p>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Sélectionnez l'enfant</label>
            <select required value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]">
              <option value="">Choisir un enfant...</option>
              {children.map((c) => (
                <option key={c.matricule} value={String(c.matricule)}>{c.prenom} {c.nom} ({c.niveau})</option>
              ))}
            </select>
          </div>

          {scolariteError && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius)] text-sm text-amber-700">
              <span>⚠️</span> {scolariteError}
            </div>
          )}

          {scolarite && (
            <>
              <div className="bg-gray-50 p-4 rounded-[var(--radius)] border border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frais d'inscription</span>
                  <span className="font-bold">{scolarite.montantInscription.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pension annuelle</span>
                  <span className="font-bold">{scolarite.montantPension.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Par tranche ({scolarite.nombreTranches}x)</span>
                  <span className="font-bold">{pensionParTranche.toLocaleString()} FCFA</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Échéancier</span>
                  <span />
                </div>
                {scolarite.tranches.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={12} />
                    <span className="font-medium">{t.libelle} :</span>
                    <span>{t.montant.toLocaleString()} FCFA</span>
                    <span className="text-gray-400">— {new Date(t.dateLimite).toLocaleDateString('fr-FR')}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de tranches à payer</label>
                <div className="flex gap-2">
                  {Array.from({ length: scolarite.nombreTranches }, (_, i) => i + 1).map((num) => (
                    <button key={num} type="button" onClick={() => setSelectedTranches(num)}
                      className={`flex-1 py-3 rounded-[var(--radius)] font-bold transition-all ${
                        selectedTranches === num ? 'bg-[var(--navy)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {num} {num > 1 ? 'Tranches' : 'Tranche'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-[var(--radius)] flex justify-between items-center border border-dashed border-gray-300">
                <span className="text-gray-600 font-medium">Montant à verser :</span>
                <span className="text-2xl font-black" style={{ color: 'var(--navy)' }}>
                  {totalAmount.toLocaleString()} FCFA
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mode de paiement</label>
                <div className="grid grid-cols-2 gap-3">
                  {['CASH', 'VIREMENT'].map((m) => (
                    <button key={m} type="button" onClick={() => setModePaiement(m)}
                      className={`py-3 text-sm rounded-[var(--radius)] border font-bold transition-all ${
                        modePaiement === m
                          ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--navy)]'
                          : 'border-gray-100 text-gray-400 hover:border-gray-300'
                      }`}>
                      {m === 'CASH' ? "Cash à l'école" : 'Virement bancaire'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reçu de paiement</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-[var(--radius)]">
                  <div className="flex-1">
                    {recuName ? (
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Upload size={12} /> {recuName}</p>
                    ) : (
                      <p className="text-xs text-gray-400">Joindre le reçu (PDF ou photo)</p>
                    )}
                  </div>
                  <label className="text-xs bg-[var(--navy)] text-white px-3 py-1.5 rounded-lg cursor-pointer hover:brightness-110 transition-all">
                    {recuName ? 'Changer' : 'Parcourir'}
                    <input type="file" accept=".pdf,image/*" onChange={handleRecuChange} className="hidden" />
                  </label>
                </div>
              </div>

              <SubmitBtn loading={submitting} text="Envoyer la demande de paiement" loadingText="Traitement en cours..." className="w-full btn-admin justify-center text-base py-4" />
            </>
          )}
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2><Clock size={18} style={{ color: 'var(--navy)' }} /> Historique des paiements</h2>
        </div>
        {loadingHistory ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : myPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucun paiement enregistré.</div>
        ) : (
          <ul>
            {myPayments.map((p) => (
              <li key={p.id} className="flex justify-between items-center p-4 border-b last:border-none">
                <div>
                  <p className="font-bold text-gray-800">Versement pour {p.eleve.prenom} {p.eleve.nom}</p>
                  <p className="text-sm text-gray-500">
                    {p.montant.toLocaleString()} FCFA · {p.modePaiement === 'CASH' ? 'Cash école' : p.modePaiement === 'VIREMENT' ? 'Virement' : p.methode?.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    p.status === 'VALIDATED' ? 'bg-green-100 text-green-700' :
                    p.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.status === 'VALIDATED' ? 'Validé' : p.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ParentPayment;
