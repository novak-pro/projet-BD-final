import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPlanning = async (req: Request, res: Response) => {
  try {
    const { idCours, idSalle, jour, heureDebut, heureFin } = req.body;

    // 1. Vérifier si la salle est libre sur ce créneau
    const conflitSalle = await prisma.emploiDuTemps.findFirst({
      where: {
        idSalle: Number(idSalle),
        jour: jour,
        AND: [
          { heureDebut: { lte: heureFin } },
          { heureFin: { gte: heureDebut } }
        ]
      }
    });

    if (conflitSalle) {
      return res.status(400).json({ error: "La salle est déjà occupée à cette heure." });
    }

    // 2. Créer le créneau
    const planning = await prisma.emploiDuTemps.create({
      data: {
        idCours: Number(idCours),
        idSalle: Number(idSalle),
        jour,
        heureDebut,
        heureFin
      }
    });

    res.status(201).json(planning);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du planning" });
  }
};

// Récupérer l'emploi du temps d'une classe (Pour les Parents)
export const getPlanningByClasse = async (req: Request, res: Response) => {
  const { idClasse } = req.params;
  try {
    const edt = await prisma.emploiDuTemps.findMany({
      where: { cours: { idClasse: Number(idClasse) } },
      include: {
        salle: true,
        cours: {
          include: {
            matiere: true,
            enseignant: true
          }
        }
      },
      orderBy: { heureDebut: 'asc' }
    });
    res.json(edt);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};