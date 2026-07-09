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

function mapToIncidentType(type: string) {
  const upper = type?.toUpperCase() || 'AUTRE';
  if (upper.includes('RETARD')) return 'RETARD' as any;
  if (upper.includes('ABSENCE') || upper.includes('INJUSTIFIEE')) return 'ABSENCE_INJUSTIFIEE' as any;
  if (upper.includes('COMPORTEMENT')) return 'COMPORTEMENT' as any;
  return 'AUTRE' as any;
}

export const rapporterIncident = async (req: AuthRequest, res: Response): Promise<void> => {
  const { eleveId, type, gravite, pointsDeduits, commentaire, auteur } = req.body as any;
  const userRole = req.user?.role;
  const isAdmin = userRole === 'ADMIN_PRINCIPAL';
  const status = isAdmin ? 'APPROVED' : 'PENDING';

  try {
    const result = await prisma.$transaction(async (tx) => {
      const incident = await tx.incident.create({
        data: { eleveId, type: mapToIncidentType(type), gravite, pointsDeduits, commentaire, auteur, status }
      });

      if (isAdmin) {
        const eleve = await tx.eleve.update({
          where: { matricule: eleveId },
          data: { soldePoints: { decrement: pointsDeduits } }
        });

        if (eleve.soldePoints < 0) {
          await tx.eleve.update({
            where: { matricule: eleveId },
            data: { soldePoints: 0 }
          });
        }

        return {
          incident,
          soldeActuel: eleve.soldePoints < 0 ? 0 : eleve.soldePoints,
          niveauAlerte:
            (eleve.soldePoints < 0 ? 0 : eleve.soldePoints) === 0 ? 'CRITIQUE' :
            (eleve.soldePoints < 0 ? 0 : eleve.soldePoints) <= 5 ? 'DANGER' :
            (eleve.soldePoints < 0 ? 0 : eleve.soldePoints) <= 10 ? 'WARNING' : null,
          alerte: (eleve.soldePoints < 0 ? 0 : eleve.soldePoints) <= 10,
          message: "Incident enregistré"
        };
      }

      return {
        incident,
        message: "Signalement envoyé à l'administration pour validation"
      };
    });

    // Notification aux admins (hors transaction pour isolation)
    if (!isAdmin) {
      try {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN_PRINCIPAL', status: 'ACTIVE' },
          select: { id: true }
        });
        if (admins.length > 0) {
          const auteurNom = auteur || 'Un enseignant';
          await prisma.message.createMany({
            data: admins.map(a => ({
              content: `[Discipline] ${auteurNom} a signalé un incident concernant l'élève #${eleveId}`,
              type: 'PERSONAL',
              status: 'SENT',
              senderId: req.user!.id,
              recipientId: a.id,
            })),
          });
        }
      } catch (notifErr: any) {
        console.error('Erreur notification admin:', notifErr?.message);
      }
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Erreur rapporterIncident:', error?.message || error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement de l'incident", detail: error?.message });
  }
};

// Admin : récupérer tous les incidents en attente
export const getPendingIncidents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const incidents = await prisma.incident.findMany({
      where: { status: 'PENDING' },
      include: {
        eleve: { select: { matricule: true, nom: true, prenom: true, classroomId: true } }
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
          ...(type && { type: mapToIncidentType(type) }),
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

// ---- CRUD TypeInfraction ----

export const getTypeInfractions = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const types = await prisma.typeInfraction.findMany({ orderBy: { id: 'asc' } });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération des types d'infraction" });
  }
};

export const createTypeInfraction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { libelle, gravite, pointsMalus } = req.body;
    if (!libelle || !gravite) {
      res.status(400).json({ error: "Champs requis : libelle, gravite" });
      return;
    }
    const type = await prisma.typeInfraction.create({
      data: { libelle, gravite, pointsMalus: Number(pointsMalus) || 0 },
    });
    res.status(201).json(type);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: "Ce libellé existe déjà" });
      return;
    }
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

export const updateTypeInfraction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { libelle, gravite, pointsMalus } = req.body;
    const type = await prisma.typeInfraction.update({
      where: { id },
      data: { ...(libelle && { libelle }), ...(gravite && { gravite }), ...(pointsMalus !== undefined && { pointsMalus: Number(pointsMalus) }) },
    });
    res.json(type);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: "Ce libellé existe déjà" });
      return;
    }
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

export const deleteTypeInfraction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.typeInfraction.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Type d'infraction supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
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
