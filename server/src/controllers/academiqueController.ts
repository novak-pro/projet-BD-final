import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// ── Années Académiques ──

export const getAllAnnees = async (req: Request, res: Response) => {
  try {
    const annees = await prisma.anneeAcademique.findMany({
      include: {
        trimestres: {
          include: { sessions: true },
          orderBy: { idTrimestre: 'asc' },
        },
      },
      orderBy: { dateDebut: 'desc' },
    });
    res.json(annees);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

export const createAnnee = async (req: Request, res: Response) => {
  try {
    const { libelle, dateDebut, dateFin } = req.body;
    const annee = await prisma.anneeAcademique.create({
      data: { libelle, dateDebut: new Date(dateDebut), dateFin: new Date(dateFin) },
    });
    res.status(201).json(annee);
  } catch (error) {
    res.status(500).json({ error: "Erreur de création" });
  }
};

export const updateAnnee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { libelle, dateDebut, dateFin, active } = req.body;
    const annee = await prisma.anneeAcademique.update({
      where: { idAcademi: id },
      data: {
        ...(libelle !== undefined && { libelle }),
        ...(dateDebut !== undefined && { dateDebut: new Date(dateDebut) }),
        ...(dateFin !== undefined && { dateFin: new Date(dateFin) }),
        ...(active !== undefined && { active }),
      },
    });
    res.json(annee);
  } catch (error) {
    res.status(500).json({ error: "Erreur de mise à jour" });
  }
};

export const deleteAnnee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await prisma.anneeAcademique.delete({ where: { idAcademi: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erreur de suppression" });
  }
};

export const setActiveAnnee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await prisma.anneeAcademique.updateMany({ data: { active: false } });
    const annee = await prisma.anneeAcademique.update({
      where: { idAcademi: id },
      data: { active: true },
    });
    res.json(annee);
  } catch (error) {
    res.status(500).json({ error: "Erreur d'activation" });
  }
};

// ── Trimestres ──

export const createTrimestre = async (req: Request, res: Response) => {
  try {
    const { libelle, idAcademi } = req.body;
    const trimestre = await prisma.trimestre.create({
      data: { libelle, idAcademi: parseInt(idAcademi) },
    });
    res.status(201).json(trimestre);
  } catch (error) {
    res.status(500).json({ error: "Erreur de création du trimestre" });
  }
};

export const deleteTrimestre = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await prisma.trimestre.delete({ where: { idTrimestre: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erreur de suppression" });
  }
};

// ── Sessions ──

export const createSession = async (req: Request, res: Response) => {
  try {
    const { libelle, idTrimestre } = req.body;
    const session = await prisma.session.create({
      data: { libelle, idTrimestre: parseInt(idTrimestre) },
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: "Erreur de création de la session" });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await prisma.session.delete({ where: { idSession: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erreur de suppression" });
  }
};
