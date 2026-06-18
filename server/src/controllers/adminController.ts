import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Récupérer tous les comptes en attente de validation (PENDING)
export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'PENDING' },
      include: {
        personnelProfile: true, // Inclure les infos du personnel
        parentProfile: true     // Inclure les infos du parent
      }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des comptes." });
  }
};

// Valider (ACTIVE) ou Refuser (DISABLED) un compte
export const handleUserValidation = async (req: Request, res: Response) => {
  const { userId, action } = req.body; // action doit être 'ACTIVE' ou 'DISABLED'

  try {
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { status: action }
    });

    const message = action === 'ACTIVE' 
      ? "Le compte a été activé avec succès." 
      : "Le compte a été refusé et désactivé.";

    res.json({ message });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erreur lors de la mise à jour du statut." });
  }
};