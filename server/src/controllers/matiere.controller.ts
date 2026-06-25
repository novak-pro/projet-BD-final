import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createMatiere = async (req: Request, res: Response) => {
  try {
    const { nom } = req.body;
    const matiere = await prisma.matiere.create({
      data: { nom }
    });
    res.status(201).json(matiere);
  } catch (error) {
    res.status(500).json({ error: "Cette matière existe déjà" });
  }
};

export const getMatieres = async (req: Request, res: Response) => {
  const matieres = await prisma.matiere.findMany({
    include: { _count: { select: { livres: true, cours: true } } }
  });
  res.json(matieres);
};

export const updateMatiere = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, code } = req.body;
    const matiere = await prisma.matiere.update({
      where: { id: Number(id) },
      data: { ...(nom && { nom }), ...(code !== undefined && { code }) },
    });
    res.json(matiere);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

export const deleteMatiere = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.matiere.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};