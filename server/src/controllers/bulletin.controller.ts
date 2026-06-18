import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const calculerBulletinsClasse = async (req: Request, res: Response): Promise<void> => {
  const { idClasse, evaluation } = req.query;

  try {
    const eleves = await prisma.eleve.findMany({
      where: { salleId: Number(idClasse) },
      include: {
        notes: {
          where: { evaluation: String(evaluation) },
          include: {
            matiere: {
              include: {
                cours: { where: { idClasse: Number(idClasse) } }
              }
            }
          }
        }
      }
    });

    // Calculer la moyenne de chaque élève
    let palmares = eleves.map(eleve => {
      let totalPoints = 0;
      let totalCoeffs = 0;

      eleve.notes.forEach(note => {
        const coeff = note.matiere.cours[0]?.coefficient || 1;
        totalPoints += note.valeur * coeff;
        totalCoeffs += coeff;
      });

      const moyenneGenerale = totalCoeffs > 0 ? (totalPoints / totalCoeffs) : 0;

      return {
        matricule: eleve.matricule,
        nom: eleve.nom,
        prenom: eleve.prenom,
        moyenne: parseFloat(moyenneGenerale.toFixed(2)),
        totalPoints,
        totalCoeffs
      };
    });

    // Trier par moyenne décroissante
    palmares.sort((a, b) => b.moyenne - a.moyenne);

    // ✅ Attribuer les rangs avec gestion des ex-æquo
    let rang = 1;
    const bulletinsAvecRangs = palmares.map((eleve, index) => {
      if (index > 0 && eleve.moyenne < palmares[index - 1].moyenne) {
        rang = index + 1; // Nouveau rang seulement si moyenne différente
      }
      return { ...eleve, rang };
    });

    // Exemple de résultat :
    // 15.00 → Rang 1
    // 15.00 → Rang 1  ← ex-æquo
    // 13.00 → Rang 3  ← pas Rang 2

    res.json(bulletinsAvecRangs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du calcul des bulletins" });
  }
};