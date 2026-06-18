import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Récupérer tout le personnel avec leurs cours et matières
export const getAllPersonnel = async (req: Request, res: Response) => {
  try {
    const personnel = await prisma.personnel.findMany({
      include: {
        user: { select: { email: true, status: true } },
        cours: {
          include: {
            matiere: true,
            classe: true
          }
        }
      }
    });
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du personnel" });
  }
};

// AFFECTATION : Lier un enseignant à une matière dans une classe (Point 4 du PDF)
export const affecterEnseignant = async (req: Request, res: Response) => {
  try {
    const { personnelId, idMatiere, idClasse, coefficient } = req.body;

    // On crée ou met à jour un "Cours" (l'affectation)
    const affectation = await prisma.cours.create({
      data: {
        enseignantId: Number(personnelId),
        idMatiere: Number(idMatiere),
        idClasse: Number(idClasse),
        coefficient: coefficient || 1.0
      }
    });

    res.status(201).json({ message: "Affectation réussie", affectation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'affectation" });
  }
};