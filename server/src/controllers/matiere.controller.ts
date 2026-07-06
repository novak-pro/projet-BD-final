import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createMatiere = async (req: Request, res: Response) => {
  try {
    const { nom, code, classIds } = req.body;
    const matiere = await prisma.matiere.create({
      data: {
        nom,
        code: code ?? null,
        classes: classIds?.length
          ? { create: classIds.map((id: number) => ({ idClasse: Number(id) })) }
          : undefined,
      },
      include: { classes: { include: { classe: { include: { cycle: true } } } } },
    });
    res.status(201).json(matiere);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: "Cette matière existe déjà" });
      return;
    }
    res.status(500).json({ error: "Erreur lors de la création de la matière" });
  }
};

export const getMatieres = async (req: Request, res: Response) => {
  const matieres = await prisma.matiere.findMany({
    include: {
      _count: { select: { livres: true, cours: true } },
      classes: { include: { classe: { include: { cycle: true } } } },
    },
    orderBy: { nom: 'asc' }
  });
  res.json(matieres);
};

export const updateMatiere = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, code, classIds } = req.body;
    const matiere = await prisma.matiere.update({
      where: { id: Number(id) },
      data: {
        ...(nom && { nom }),
        ...(code !== undefined && { code }),
        classes: classIds !== undefined
          ? {
              deleteMany: {},
              create: classIds.map((id: number) => ({ idClasse: Number(id) })),
            }
          : undefined,
      },
      include: { classes: { include: { classe: { include: { cycle: true } } } } },
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
