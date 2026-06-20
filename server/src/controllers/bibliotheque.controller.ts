import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getAllLivres = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const livres = await prisma.livre.findMany({
      include: { matiere: true },
      orderBy: { titre: 'asc' }
    });
    res.json(livres);
  } catch (error) {
    res.status(500).json({ error: "Erreur de recuperation des livres" });
  }
};

export const getLivreById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const livre = await prisma.livre.findUnique({
      where: { id: Number((req as any).params.id) },
      include: { matiere: true }
    });
    if (!livre) {
      res.status(404).json({ error: "Livre non trouve" });
      return;
    }
    res.json(livre);
  } catch (error) {
    res.status(500).json({ error: "Erreur de recuperation" });
  }
};

export const createLivre = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { titre, auteur, maisonEdition, description, cycle, classeConcernee, langue, couvertureUrl, pdfUrl, idMatiere } = req.body as any;
    const livre = await prisma.livre.create({
      data: { titre, auteur, maisonEdition, description, cycle, classeConcernee, langue, couvertureUrl, pdfUrl, idMatiere: Number(idMatiere) }
    });
    res.status(201).json(livre);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la creation" });
  }
};

export const updateLivre = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number((req as any).params.id);
    const { titre, auteur, maisonEdition, description, cycle, classeConcernee, langue, couvertureUrl, pdfUrl, idMatiere } = req.body as any;
    const livre = await prisma.livre.update({
      where: { id },
      data: { titre, auteur, maisonEdition, description, cycle, classeConcernee, langue, couvertureUrl, pdfUrl, idMatiere: idMatiere ? Number(idMatiere) : undefined }
    });
    res.json(livre);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise a jour" });
  }
};

export const deleteLivre = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.livre.delete({ where: { id: Number((req as any).params.id) } });
    res.json({ message: "Livre supprime avec succes" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};
