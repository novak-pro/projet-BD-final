import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const rapporterIncident = async (req: AuthRequest, res: Response): Promise<void> => {
  const { eleveId, type, gravite, pointsDeduits, commentaire, auteur } = req.body as any;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le rapport d'incident
      const incident = await tx.incident.create({
        data: { eleveId, type, gravite, pointsDeduits, commentaire, auteur }
      });

      // 2. Mettre à jour le solde de points de l'élève
      let eleve = await tx.eleve.update({
        where: { matricule: eleveId },
        data: { soldePoints: { decrement: pointsDeduits } }
      });

      // ✅ 3. Empêcher le solde de devenir négatif
      if (eleve.soldePoints < 0) {
        eleve = await tx.eleve.update({
          where: { matricule: eleveId },
          data: { soldePoints: 0 }
        });
      }

      // ✅ 4. Niveaux d'alerte selon le solde restant
      const niveauAlerte =
        eleve.soldePoints === 0  ? 'CRITIQUE' :  // Exclusion possible
        eleve.soldePoints <= 5   ? 'DANGER'   :  // Très risqué
        eleve.soldePoints <= 10  ? 'WARNING'  :  // À surveiller
        null;                                     // Situation normale

      return { 
        incident, 
        soldeActuel: eleve.soldePoints, 
        niveauAlerte,
        // Rétrocompatibilité avec l'ancien champ alerte
          alerte: eleve.soldePoints <= 10 
      };
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement de l'incident" });
  }
};