import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Helicopter } from 'lucide-react';

export const generateInvoicePDF = (payment: any) => {
  const doc = new jsPDF();
  const date = new Date(payment.updatedAt).toLocaleDateString();

  // --- ENTÊTE ---
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("FACTURE DE SCOLARITÉ", 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Référence : INV-${payment.id}-${new Date().getFullYear()}`, 20, 30);
  doc.text(`Date de validation : ${date}`, 20, 35);

  // --- INFOS ÉCOLE & ÉLÈVE ---
  doc.setDrawColor(200);
  doc.line(20, 40, 190, 40);

  doc.setFont('helvetica', 'bold');
  doc.text("ÉCOLE PRIMAIRE PRIVÉE [NOM]", 20, 50);
  doc.setFont('helvetica', 'normal');
  doc.text("BP: 1234 Yaoundé, Cameroun", 20, 55);

  doc.setFont('helvetica', 'bold');
  doc.text("ÉLÈVE :", 120, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`${payment.eleve.prenom} ${payment.eleve.nom}`, 120, 55);
  doc.text(`Classe : ${payment.eleve.niveau}`, 120, 60);

  // --- DÉTAILS PAIEMENT ---
  autoTable(doc, {
    startY: 70,
    head: [['Désignation', 'Quantité/Tranches', 'Mode', 'Montant (FCFA)']],
    body: [
      ['Pension Scolaire', `${payment.nombreTranches} tranche(s)`, payment.methode, payment.montant.toLocaleString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }
  });

  // --- RÉCAPITULATIF FINANCIER ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL PAYÉ : ${payment.montant.toLocaleString()} FCFA`, 140, finalY);
  
  // Note de bas de page
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Cette facture est générée numériquement et constitue une preuve de paiement officielle.", 105, 280, { align: 'center' });

  // Téléchargement
  doc.save(`Facture_${payment.eleve.nom}_${payment.id}.pdf`);
};