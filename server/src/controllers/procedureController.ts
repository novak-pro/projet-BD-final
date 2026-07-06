import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getProcedure = async (req: Request, res: Response) => {
  try {
    const proc = await prisma.procedureInscription.findFirst({ orderBy: { id: 'desc' } });
    res.json(proc ? proc : { contenu: '' });
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

export const updateProcedure = async (req: Request, res: Response) => {
  try {
    const { contenu } = req.body;
    const existing = await prisma.procedureInscription.findFirst({ orderBy: { id: 'desc' } });
    if (existing) {
      const updated = await prisma.procedureInscription.update({ where: { id: existing.id }, data: { contenu } });
      return res.json(updated);
    }
    const created = await prisma.procedureInscription.create({ data: { contenu } });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Erreur de mise à jour" });
  }
};
