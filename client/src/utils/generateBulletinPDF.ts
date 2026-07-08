import jsPDF from 'jspdf';

const NAVY = '#1B2A4A';
const ACCENT = '#4A7DC9';
const GREEN = '#16a34a';
const ORANGE = '#ca8a04';
const RED = '#dc2626';
const GRAY = '#6b7280';
const LIGHT_BG = '#f0f4ff';

interface NoteDetail {
  matiere: string;
  valeur: number;
  coefficient: number;
  points: number;
  enseignant: string | null;
  moyenneClasse: number | null;
  appreciation: string | null;
}

interface BulletinData {
  eleve: { matricule: number; nom: string; prenom: string; niveau: string; photoAdmin?: string | null };
  classe: { libelle: string; effectif: number; titulaire: { nom: string; prenom: string } | null };
  evaluation: string;
  details: NoteDetail[];
  moyenneGenerale: number;
  rang: number;
  totalPoints: number;
  totalCoeffs: number;
  moyenneClasseGenerale: number;
  absences: number;
  retards: number;
}

function noteColor(v: number): [number, number, number] {
  if (v >= 16) return [22, 163, 74];
  if (v >= 12) return [75, 125, 201];
  if (v >= 10) return [202, 138, 4];
  return [220, 38, 38];
}

function mention(moyenne: number): string {
  if (moyenne >= 18) return 'Excellent';
  if (moyenne >= 16) return 'Très Bien';
  if (moyenne >= 14) return 'Bien';
  if (moyenne >= 12) return 'Assez Bien';
  if (moyenne >= 10) return 'Passable';
  return 'Insuffisant';
}

export function generateBulletinPDF(data: BulletinData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const ml = 18;
  const mr = 18;
  const cw = pw - ml - mr;
  let y = 16;

  // ─── Helper: draw rounded rect card ───
  function card(x: number, y: number, w: number, h: number, fill?: string, stroke?: string) {
    const r = 4;
    doc.setDrawColor(220, 220, 230);
    if (stroke) doc.setDrawColor(...hexToRgb(stroke));
    if (fill) {
      doc.setFillColor(...hexToRgb(fill));
      doc.roundedRect(x, y, w, h, r, r, 'F');
    } else {
      doc.roundedRect(x, y, w, h, r, r, 'S');
    }
  }

  function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  // ─── 1. EN-TÊTE ───
  // Bandeau navy
  doc.setFillColor(...hexToRgb(NAVY));
  doc.rect(0, 0, pw, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉCOLE EXCELLENCE', ml, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('« La connaissance est la clé de la réussite »', ml, 23);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BULLETIN SCOLAIRE', pw / 2, 34, { align: 'center' });

  // Infos sous le bandeau
  y = 50;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  doc.setFont('helvetica', 'normal');

  // Photo admin (au-dessus du nom)
  let leftX = ml;
  if (data.eleve.photoAdmin) {
    const photoW = 22;
    const photoH = 28;
    const photoY = 44;
    try {
      doc.addImage(data.eleve.photoAdmin, 'JPEG', ml, photoY, photoW, photoH);
      leftX = ml + photoW + 6;
    } catch (_e) { /* ignorer si l'image est invalide */ }
  }

  const leftCol = [
    `Élève : ${data.eleve.nom} ${data.eleve.prenom}`,
    `Niveau : ${data.eleve.niveau}`,
    `Matricule : #${data.eleve.matricule}`,
  ];
  const rightCol = [
    `Classe : ${data.classe.libelle}`,
    `Période : ${data.evaluation}`,
    `Effectif : ${data.classe.effectif} élèves`,
  ];

  leftCol.forEach((l, i) => {
    doc.setFont('helvetica', 'normal');
    doc.text(l, leftX, y + i * 6);
  });
  rightCol.forEach((r, i) => {
    doc.setFont('helvetica', 'normal');
    doc.text(r, pw / 2, y + i * 6);
  });

  // Ligne de séparation
  y += 24;
  doc.setDrawColor(220, 220, 230);
  doc.line(ml, y, ml + cw, y);
  y += 6;

  // ─── 2. NOTES PAR MATIÈRE ───
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('RÉSULTATS PAR MATIÈRE', ml, y);
  y += 4;

  data.details.forEach((d, idx) => {
    const c = noteColor(d.valeur);
    const blockH = 28;

    // Vérifier si on a assez de place pour le bloc + résumé + appréciation
    const remaining = ph - y - blockH - 65;
    if (remaining < 0) {
      doc.addPage();
      y = 20;
    }

    // Fond de carte léger
    card(ml, y, cw, blockH, idx % 2 === 0 ? LIGHT_BG : '#ffffff');

    // Liseré coloré à gauche
    doc.setFillColor(c[0], c[1], c[2]);
    doc.rect(ml, y, 3, blockH, 'F');

    // Nom matière
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(NAVY));
    doc.text(d.matiere, ml + 10, y + 7);

    // Enseignant
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(GRAY));
    if (d.enseignant) doc.text(`Enseignant(e) : ${d.enseignant}`, ml + 10, y + 13);

    // Note élève (grande, à droite)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(c[0], c[1], c[2]);
    const noteText = `${d.valeur.toFixed(2)}/20`;
    doc.text(noteText, ml + cw - 10, y + 10, { align: 'right' });

    // Coefficient
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(GRAY));
    doc.text(`Coeff: ${d.coefficient}`, ml + cw - 10, y + 17, { align: 'right' });

    // Moyenne classe
    if (d.moyenneClasse !== null) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hexToRgb(GRAY));
      doc.text(`Moy. classe: ${d.moyenneClasse.toFixed(2)}`, ml + 10, y + 22);
    }

    // Points
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(GRAY));
    doc.text(`Points: ${d.points.toFixed(2)}`, ml + cw / 2, y + 22);
    y += blockH + 3;
  });

  // ─── 3. RÉSULTATS GÉNÉRAUX ───
  const summaryY = y + 3;
  if (summaryY + 80 > ph) {
    doc.addPage();
    y = 20;
  } else {
    y = summaryY;
  }

  doc.setDrawColor(...hexToRgb(ACCENT));
  doc.setFillColor(245, 248, 255);
  const summaryH = 42;
  doc.roundedRect(ml, y, cw, summaryH, 6, 6, 'FD');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('RÉSULTATS GÉNÉRAUX', ml + 8, y + 8);

  // Moyenne générale
  const mg = data.moyenneGenerale;
  const mgColor = noteColor(mg);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mgColor[0], mgColor[1], mgColor[2]);
  doc.text(`${mg.toFixed(2)}/20`, ml + 8, y + 32);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text('Moyenne Générale', ml + 8, y + 38);

  // Rang
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text(`#${data.rang}`, pw / 2 - 8, y + 28);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text(`Rang (sur ${data.classe.effectif} élèves)`, pw / 2 - 8, y + 38);

  // Moyenne classe et mention
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(ACCENT));
  doc.text(`${data.moyenneClasseGenerale.toFixed(2)}`, pw / 2 + 35, y + 28);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  doc.text('Moy. de la classe', pw / 2 + 35, y + 38);

  // Mention
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mgColor[0], mgColor[1], mgColor[2]);
  doc.text(mention(mg), ml + cw - 8, y + 28, { align: 'right' });

  y += summaryH + 8;

  // ─── 4. APPRÉCIATION GÉNÉRALE ───
  if (y + 30 > ph) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('APPRÉCIATION GÉNÉRALE', ml, y);
  y += 5;

  doc.setDrawColor(200, 200, 210);
  doc.line(ml, y, ml + cw, y);
  y += 3;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 80, 90);

  const appreciation = data.classe.titulaire
    ? `${data.eleve.prenom} a obtenu une moyenne de ${data.moyenneGenerale.toFixed(2)}/20, se classant ${data.rang}e sur ${data.classe.effectif} élèves. ${mention(data.moyenneGenerale)}. ${data.classe.titulaire.prenom} ${data.classe.titulaire.nom} (Titulaire).`
    : `${data.eleve.prenom} a obtenu une moyenne de ${data.moyenneGenerale.toFixed(2)}/20, se classant ${data.rang}e sur ${data.classe.effectif} élèves. ${mention(data.moyenneGenerale)}.`;
  const lines = doc.splitTextToSize(appreciation, cw);
  doc.text(lines, ml, y + 3, { lineHeightFactor: 1.6 });
  y += lines.length * 4.5 + 8;

  // ─── 5. ASSIDUITÉ ───
  if (y + 20 > ph) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  doc.text('ASSIDUITÉ', ml, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRgb(GRAY));
  const assiduiteData = [
    `Absences : ${data.absences}`,
    `Retards : ${data.retards}`,
  ];
  assiduiteData.forEach(a => {
    doc.text(a, ml + 4, y);
    y += 5;
  });

  // ─── 6. PIED DE PAGE ───
  y = Math.max(y, ph - 35);

  doc.setDrawColor(200, 200, 210);
  doc.line(ml, y, ml + cw, y);
  y += 4;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 140, 150);
  doc.text(`Document édité le ${new Date().toLocaleDateString('fr-FR')}`, ml, y, { align: 'left' });
  y += 10;

  // Signatures
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRgb(NAVY));
  const sigW = 55;
  const sigSpacing = (cw - sigW * 3) / 4;
  const sigStart = ml + sigSpacing;
  ['Enseignant(e)', 'Directeur(trice)', 'Parent'].forEach((label, i) => {
    const x = sigStart + i * (sigW + sigSpacing);
    doc.text(label, x, y, { align: 'center' });
    doc.setDrawColor(200, 200, 210);
    doc.line(x, y + 3, x + sigW, y + 3);
  });

  // Sauvegarde
  const filename = `Bulletin_${data.eleve.nom}_${data.eleve.prenom}_${data.evaluation.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
