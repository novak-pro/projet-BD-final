import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const deposerEpreuve = async (req: Request, res: Response) => {
  try {
    const { idMatiere, idClasse, evaluation, anneeAcad, auteur, sujetUrl, corrigeUrl } = req.body;

    if (!sujetUrl || !corrigeUrl) {
      return res.status(400).json({ error: "Le sujet ET le corrigé sont obligatoires." });
    }

    const epreuve = await prisma.epreuve.create({
      data: {
        idMatiere: Number(idMatiere),
        idClasse: Number(idClasse),
        evaluation,
        anneeAcad,
        auteur,
        sujetUrl,
        corrigeUrl
      }
    });

    res.status(201).json(epreuve);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du dépôt de l'épreuve" });
  }
};

export const getEpreuves = async (req: Request, res: Response) => {
  try {
    const epreuves = await prisma.epreuve.findMany({
      include: { matiere: true, classe: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(epreuves);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};