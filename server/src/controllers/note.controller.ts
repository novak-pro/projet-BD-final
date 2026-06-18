import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const enregistrerNotesGroupees = async (req: AuthRequest, res: Response): Promise<void> => {
  const { idMatiere, idClasse, evaluation, notes } = req.body as any;
  // notes = [{ eleveId: 1, valeur: 15 }, { eleveId: 2, valeur: 12 }]

  try {
    const transactions = notes.map((n: any) =>
      prisma.note.create({
        data: {
          valeur: n.valeur,
          evaluation: evaluation,
          idMatiere: idMatiere,
          eleveId: n.eleveId
        }
      })
    );

    await prisma.$transaction(transactions);
    res.json({ message: "Notes enregistrées avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la saisie des notes" });
  }
};