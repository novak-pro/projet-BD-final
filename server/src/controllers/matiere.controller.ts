import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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