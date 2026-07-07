import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, Upload } from 'lucide-react';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';
import { notifySuccess, notifyError } from '../utils/notifications';
import SubmitBtn from '../components/SubmitBtn';

interface Child {
  matricule: number;
  nom: string;
  prenom: string;
  niveau: string;
}

interface FeeConfig {
  montantTotal: number;
  montantTranche: number;
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
  const [config, setConfig] = useState<FeeConfig | null>(null);
  const [tranches, setTranches] = useState<number>(1);
  const [modePaiement, setModePaiement] = useState<string>('');
  const [recuPDF, setRecuPDF] = useState<string>('');
  const [recuName, setRecuName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    api.get('/enrollments/my-children')
      .then((res) => setChildren(res.data))
      .catch(() => console.error('Impossible de charger les enfants'));
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    api.get(`/payments/config/${selectedChild}`)
      .then((res) => setConfig(res.data))
      .catch(() => console.error('Impossible de charger la configuration'));
  }, [selectedChild]);

  useEffect(() => {
    setLoadingHistory(true);
    api.get('/payments/my-payments')
      .then((res) => setMyPayments(res.data))
      .catch(() => console.error('Impossible de charger l\'historique'))
      .finally(() => setLoadingHistory(false));
  }, []);

  const totalAmount = config ? config.montantTranche * tranches : 0;

  const resetForm = () => {
    setSelectedChild('');
    setConfig(null);
    setTranches(1);
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

    setLoading(true);
    try {
      await api.post('/payments/initiate', {
        eleveId: selectedChild,
        nombreTranches: tranches,
        methode: 'CARTE_BANCAIRE',
        transactionRef: `OFFLINE-${Date.now()}`,
        montant: totalAmount,
        modePaiement,
        recuPDF,
      });
      notifySuccess('Demande de paiement envoyée avec succès !');
      resetForm();
    } catch (err) {
      notifyError('Erreur lors de l\'envoi du paiement.');
    } finally {
      setLoading(false);
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

          {config && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de tranches à payer</label>
                <div className="flex gap-4">
                  {[1, 2, 3].map((num) => (
                    <button key={num} type="button" onClick={() => setTranches(num)}
                      className={`flex-1 py-3 rounded-[var(--radius)] font-bold transition-all ${
                        tranches === num ? 'bg-[var(--navy)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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

              {/* Mode de paiement hors-ligne */}
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
                      {m === 'CASH' ? 'Cash à l\'école' : 'Virement bancaire'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload reçu */}
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

              <SubmitBtn loading={loading} text="Envoyer la demande de paiement" loadingText="Traitement en cours..." className="w-full btn-admin justify-center text-base py-4" />
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
