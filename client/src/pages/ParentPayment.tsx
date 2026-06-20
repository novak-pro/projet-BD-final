import React, { useState, useEffect } from 'react';
import { CreditCard, Clock } from 'lucide-react';
import api from '../services/axiosInstance';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from '../i18n/LanguageContext';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  status: 'VALIDATED' | 'PENDING';
  createdAt: string;
  transactionRef: string;
  eleve: {
    nom: string;
    prenom: string;
  };
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const METHODES = ['ORANGE_MONEY', 'MTN_MOMO', 'CARTE_BANCAIRE'] as const;
type Methode = typeof METHODES[number];

// ─── Composant principal ──────────────────────────────────────────────────────

const ParentPayment = () => {
  const { t } = useTranslation();
  // États du formulaire
  const [children, setChildren]           = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [config, setConfig]               = useState<FeeConfig | null>(null);
  const [tranches, setTranches]           = useState<number>(1);
  const [methode, setMethode]             = useState<Methode>('ORANGE_MONEY');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [loading, setLoading]             = useState<boolean>(false);

  // États de l'historique
  const [myPayments, setMyPayments]       = useState<Payment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // ── Chargement des données ────────────────────────────────────────────────

  useEffect(() => {
    api
      .get('/enrollments/my-children')
      .then((res) => setChildren(res.data))
      .catch(() => console.error('Impossible de charger les enfants'));
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    api
      .get(`/payments/config/${selectedChild}`)
      .then((res) => setConfig(res.data))
      .catch(() => console.error('Impossible de charger la configuration'));
  }, [selectedChild]);

  useEffect(() => {
    setLoadingHistory(true);
    api
      .get('/payments/my-payments')
      .then((res) => setMyPayments(res.data))
      .catch(() => console.error('Impossible de charger l\'historique'))
      .finally(() => setLoadingHistory(false));
  }, []);

  // ── Calculs ───────────────────────────────────────────────────────────────

  const totalAmount = config ? config.montantTranche * tranches : 0;

  // ── Réinitialisation du formulaire ────────────────────────────────────────

  const resetForm = () => {
    setSelectedChild('');
    setConfig(null);
    setTranches(1);
    setMethode('ORANGE_MONEY');
    setTransactionRef('');
  };

  // ── Soumission du paiement ────────────────────────────────────────────────

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      alert('Veuillez saisir la référence de transaction');
      return;
    }

    setLoading(true);
    try {
      await api.post('/payments/initiate', {
        eleveId: selectedChild,
        nombreTranches: tranches,
        methode,
        transactionRef,
        montant: totalAmount,
      });
      alert('Demande de paiement envoyée avec succès !');
      resetForm();
    } catch (err) {
      alert('Erreur lors de l\'envoi du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ── Génération du PDF ─────────────────────────────────────────────────────

  const generateInvoicePDF = (paiement: Payment) => {
    const doc = new jsPDF();
    const dateFormatee = new Date(paiement.createdAt).toLocaleDateString('fr-FR');

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175); // bleu
    doc.text('REÇU DE PAIEMENT', 105, 22, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Établissement Scolaire', 105, 30, { align: 'center' });

    // Ligne de séparation
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);

    // Informations
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Date : ${dateFormatee}`, 14, 46);
    doc.text(`Élève : ${paiement.eleve.prenom} ${paiement.eleve.nom}`, 14, 55);
    doc.text(`Méthode de paiement : ${paiement.methode.replace('_', ' ')}`, 14, 64);
    doc.text(`Référence : ${paiement.transactionRef}`, 14, 73);

    // Tableau
    autoTable(doc, {
      startY: 85,
      head: [['Description', 'Montant (FCFA)']],
      body: [['Frais de scolarité', paiement.montant.toLocaleString()]],
      foot: [['Total versé', `${paiement.montant.toLocaleString()} FCFA`]],
      headStyles: { fillColor: [30, 64, 175] },
      footStyles: { fillColor: [240, 245, 255], textColor: [30, 64, 175], fontStyle: 'bold' },
    });

    // Pied de page
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Ce reçu est généré automatiquement et fait foi de paiement.', 105, pageHeight - 15, { align: 'center' });

    doc.save(`recu-${paiement.eleve.prenom}-${paiement.eleve.nom}-${paiement.id}.pdf`);
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* ── Formulaire de paiement ── */}
      <div className="admin-card">
        
        <div className="admin-card-header">
          <h2>
            <CreditCard size={18} style={{ color: 'var(--navy)' }} />
            Paiement de la Pension
          </h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.88rem' }}>Réglez les frais de scolarité en quelques clics</p>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">

          {/* Sélection de l'enfant */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Sélectionnez l'enfant
            </label>
            <select
              required
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]"
            >
              <option value="">Choisir un enfant...</option>
              {children.map((c) => (
                <option key={c.matricule} value={String(c.matricule)}>
                  {c.prenom} {c.nom} ({c.niveau})
                </option>
              ))}
            </select>
          </div>

          {/* Bloc conditionnel — visible si un enfant est sélectionné */}
          {config && (
            <>
              {/* Nombre de tranches */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre de tranches à payer
                </label>
                <div className="flex gap-4">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTranches(num)}
                      className={`flex-1 py-3 rounded-[var(--radius)] font-bold transition-all ${
                        tranches === num
                          ? 'bg-[var(--navy)] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {num} {num > 1 ? 'Tranches' : 'Tranche'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Montant calculé */}
              <div className="bg-gray-50 p-4 rounded-[var(--radius)] flex justify-between items-center border border-dashed border-gray-300">
                <span className="text-gray-600 font-medium">Montant à verser :</span>
                <span className="text-2xl font-black" style={{ color: 'var(--navy)' }}>
                  {totalAmount.toLocaleString()} FCFA
                </span>
              </div>

              {/* Mode de paiement */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mode de paiement
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {METHODES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethode(m)}
                      className={`py-2 text-xs rounded-[var(--radius)] border font-bold transition-all ${
                        methode === m
                          ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--navy)]'
                          : 'border-gray-100 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Référence de transaction */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Référence de la transaction
                </label>
                <input
                  type="text"
                  required
                  placeholder="ID de transaction reçu par SMS"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]"
                />
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-admin justify-center text-base py-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Traitement en cours...' : 'Confirmer le Paiement'}
              </button>
            </>
          )}
        </form>
      </div>

      {/* ── Historique des paiements ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            <Clock size={18} style={{ color: 'var(--navy)' }} />
            Historique des paiements
          </h2>
        </div>

        {loadingHistory ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : myPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucun paiement enregistré.</div>
        ) : (
          <ul>
            {myPayments.map((p) => (
              <li key={p.id} className="flex justify-between items-center p-4 border-b last:border-none">
                
                {/* Infos du paiement */}
                <div>
                  <p className="font-bold text-gray-800">
                    Versement pour {p.eleve.prenom} {p.eleve.nom}
                  </p>
                  <p className="text-sm text-gray-500">
                    {p.montant.toLocaleString()} FCFA · {p.methode.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {/* Badge + bouton PDF */}
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    p.status === 'VALIDATED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.status === 'VALIDATED' ? 'Validé' : 'En attente'}
                  </span>

                  {p.status === 'VALIDATED' && (
                    <button
                      onClick={() => generateInvoicePDF(p)}
                      className="flex items-center gap-1 font-medium text-sm transition-colors" style={{ color: 'var(--navy)' }}
                      title="Télécharger le reçu PDF"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Reçu PDF
                    </button>
                  )}
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