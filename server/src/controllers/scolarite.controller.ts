import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllScolarites = async (_req: Request, res: Response) => {
  try {
    const data = await prisma.scolarite.findMany({
      include: {
        classe: { include: { cycle: true } },
        tranches: { orderBy: { dateLimite: 'asc' } },
      },
      orderBy: { id: 'desc' },
    });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Erreur de récupération' });
  }
};

export const getScolariteByClasse = async (req: Request, res: Response) => {
  try {
    const data = await prisma.scolarite.findUnique({
      where: { classeId: Number(req.params.classeId) },
      include: { tranches: { orderBy: { dateLimite: 'asc' } } },
    });
    if (!data) return res.status(404).json({ error: 'Aucune scolarité configurée pour cette classe' });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Erreur de récupération' });
  }
};

export const createScolarite = async (req: Request, res: Response) => {
  try {
    const { montantInscription, montantPension, nombreTranches, classeId } = req.body;
    const data = await prisma.scolarite.create({
      data: {
        montantInscription: parseFloat(montantInscription),
        montantPension: parseFloat(montantPension),
        nombreTranches: parseInt(nombreTranches),
        classeId: parseInt(classeId),
      },
      include: { classe: true, tranches: true },
    });
    res.status(201).json(data);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'Une scolarité existe déjà pour cette classe' });
      return;
    }
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

export const updateScolarite = async (req: Request, res: Response) => {
  try {
    const { montantInscription, montantPension, nombreTranches } = req.body;
    const data = await prisma.scolarite.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(montantInscription && { montantInscription: parseFloat(montantInscription) }),
        ...(montantPension && { montantPension: parseFloat(montantPension) }),
        ...(nombreTranches && { nombreTranches: parseInt(nombreTranches) }),
      },
      include: { classe: true, tranches: true },
    });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Erreur de mise à jour' });
  }
};

export const deleteScolarite = async (req: Request, res: Response) => {
  try {
    await prisma.scolarite.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erreur de suppression' });
  }
};

// Tranches
export const createTranche = async (req: Request, res: Response) => {
  try {
    const { libelle, montant, dateLimite, scolariteId } = req.body;
    const data = await prisma.tranche.create({
      data: {
        libelle,
        montant: parseFloat(montant),
        dateLimite: new Date(dateLimite),
        scolariteId: parseInt(scolariteId),
      },
    });
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Erreur lors de la création de la tranche' });
  }
};

export const updateTranche = async (req: Request, res: Response) => {
  try {
    const { libelle, montant, dateLimite } = req.body;
    const data = await prisma.tranche.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(libelle && { libelle }),
        ...(montant && { montant: parseFloat(montant) }),
        ...(dateLimite && { dateLimite: new Date(dateLimite) }),
      },
    });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Erreur de mise à jour de la tranche' });
  }
};

export const deleteTranche = async (req: Request, res: Response) => {
  try {
    await prisma.tranche.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erreur de suppression de la tranche' });
  }
};
