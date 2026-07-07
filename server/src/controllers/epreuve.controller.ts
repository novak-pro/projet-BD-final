import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const deposerEpreuve = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const sujetFile = files?.sujet?.[0];
    const corrigeFile = files?.corrige?.[0];

    if (!sujetFile || !corrigeFile) {
      return res.status(400).json({ error: "Le sujet ET le corrigé (PDF) sont obligatoires." });
    }

    const sujetUrl = `/uploads/epreuves/${sujetFile.filename}`;
    const corrigeUrl = `/uploads/epreuves/${corrigeFile.filename}`;

    const { idMatiere, idClasse, evaluation, anneeAcad, auteur } = req.body;

    const epreuve = await prisma.epreuve.create({
      data: {
        idMatiere: Number(idMatiere),
        idClasse: Number(idClasse),
        evaluation,
        anneeAcad,
        auteur,
        sujetUrl,
        corrigeUrl,
      },
    });

    res.status(201).json(epreuve);
  } catch (error) {
    console.error("deposerEpreuve error:", error);
    res.status(500).json({ error: "Erreur lors du dépôt de l'épreuve" });
  }
};

export const getEpreuves = async (req: Request, res: Response) => {
  try {
    const epreuves = await prisma.epreuve.findMany({
      include: { matiere: true, classe: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(epreuves);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};
