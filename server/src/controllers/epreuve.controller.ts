import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const deposerEpreuve = async (req: Request, res: Response) => {
  try {
    const { matiere, classe, evaluation, anneeAcad, auteur, sujetUrl, corrigeUrl } = req.body;

    // Règle métier : Vérifier la présence du corrigé
    if (!sujetUrl || !corrigeUrl) {
      return res.status(400).json({ error: "Le sujet ET le corrigé sont obligatoires." });
    }

    const epreuve = await prisma.epreuve.create({
      data: { matiere, classe, evaluation, anneeAcad, auteur, sujetUrl, corrigeUrl }
    });

    res.status(201).json(epreuve);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du dépôt de l'épreuve" });
  }
};