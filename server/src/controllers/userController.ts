import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getDeactivatedAccounts = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'DISABLED' },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        personnelProfile: { select: { id: true, nom: true, prenom: true } },
        parentProfile: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur de récupération des comptes désactivés" });
  }
};

export const reactivateAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { status: 'ACTIVE' },
    });

    res.json({ message: "Compte réactivé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la réactivation" });
  }
};

export const deactivateAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { status: 'DISABLED' },
    });

    res.json({ message: "Compte désactivé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la désactivation" });
  }
};
