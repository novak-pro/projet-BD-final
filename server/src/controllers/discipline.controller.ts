import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getIncidentsByEleve = async (req: AuthRequest, res: Response): Promise<void> => {
  const eleveId = (req as any).params.eleveId;

  try {
    const incidents = await prisma.incident.findMany({
      where: { eleveId: Number(eleveId) },
      orderBy: { date: 'desc' }
    });

    const eleve = await prisma.eleve.findUnique({
      where: { matricule: Number(eleveId) },
      select: { soldePoints: true }
    });

    res.json({ incidents, soldePoints: eleve?.soldePoints ?? 20 });
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

export const rapporterIncident = async (req: AuthRequest, res: Response): Promise<void> => {
  const { eleveId, type, gravite, pointsDeduits, commentaire, auteur } = req.body as any;
  const userRole = req.user?.role;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le rapport d'incident
      // Si c'est un enseignant (PERSONNEL), status = PENDING et pas de déduction
      // Si c'est l'admin, status = APPROVED avec déduction
      const isAdmin = userRole === 'ADMIN_PRINCIPAL';
      const status = isAdmin ? 'APPROVED' : 'PENDING';

      const incident = await tx.incident.create({
        data: { eleveId, type, gravite, pointsDeduits, commentaire, auteur, status }
      });

      let eleve = null;
      let niveauAlerte = null;

      // 2. Déduire les points seulement si approuvé par l'admin
      if (isAdmin) {
        eleve = await tx.eleve.update({
          where: { matricule: eleveId },
          data: { soldePoints: { decrement: pointsDeduits } }
        });

        if (eleve.soldePoints < 0) {
          eleve = await tx.eleve.update({
            where: { matricule: eleveId },
            data: { soldePoints: 0 }
          });
        }

        niveauAlerte =
          eleve.soldePoints === 0  ? 'CRITIQUE' :
          eleve.soldePoints <= 5   ? 'DANGER'   :
          eleve.soldePoints <= 10  ? 'WARNING'  :
          null;
      }

      return {
        incident,
        soldeActuel: eleve?.soldePoints,
        niveauAlerte,
        alerte: eleve ? eleve.soldePoints <= 10 : false,
        message: isAdmin
          ? "Incident enregistré"
          : "Signalement envoyé à l'administration pour validation"
      };
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement de l'incident" });
  }
};

// Admin : récupérer tous les incidents en attente
export const getPendingIncidents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const incidents = await prisma.incident.findMany({
      where: { status: 'PENDING' },
      include: {
        eleve: { select: { matricule: true, nom: true, prenom: true, classeId: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

// Admin : modifier un incident (commentaire, points) puis approuver
export const updateIncident = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { type, gravite, pointsDeduits, commentaire, status } = req.body;

  try {
    const incident = await prisma.incident.findUnique({ where: { id: Number(id) } });
    if (!incident) {
      res.status(404).json({ error: "Incident non trouvé" });
      return;
    }

    const isApproving = status === 'APPROVED' && incident.status === 'PENDING';

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.incident.update({
        where: { id: Number(id) },
        data: {
          ...(type && { type }),
          ...(gravite && { gravite }),
          ...(pointsDeduits !== undefined && { pointsDeduits: Number(pointsDeduits) }),
          ...(commentaire && { commentaire }),
          ...(status && { status }),
        }
      });

      // Si on passe de PENDING à APPROVED, déduire les points
      if (isApproving) {
        let eleve = await tx.eleve.update({
          where: { matricule: incident.eleveId },
          data: { soldePoints: { decrement: Number(pointsDeduits ?? incident.pointsDeduits) } }
        });

        if (eleve.soldePoints < 0) {
          eleve = await tx.eleve.update({
            where: { matricule: incident.eleveId },
            data: { soldePoints: 0 }
          });
        }

        return { incident: updated, soldeActuel: eleve.soldePoints };
      }

      return { incident: updated };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

export const deleteIncident = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const incident = await prisma.incident.findUnique({ where: { id: Number(id) } });
    if (!incident) {
      res.status(404).json({ error: "Incident non trouvé" });
      return;
    }
    const result = await prisma.$transaction(async (tx) => {
      await tx.incident.delete({ where: { id: Number(id) } });
      // Restituer les points seulement si l'incident était approuvé
      if (incident.status === 'APPROVED') {
        const eleve = await tx.eleve.update({
          where: { matricule: incident.eleveId },
          data: { soldePoints: { increment: incident.pointsDeduits } },
        });
        return { soldeActuel: eleve.soldePoints };
      }
      return { soldeActuel: undefined };
    });
    res.json({ message: "Incident supprimé", ...result });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};
