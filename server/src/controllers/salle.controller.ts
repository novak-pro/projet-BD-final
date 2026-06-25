import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createSalle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { libelle, position, capacite, etat, idClasse, enseignantTitulaireId } = req.body;
    const salle = await prisma.salle.create({
      data: {
        libelle,
        position,
        capacite: capacite ? Number(capacite) : null,
        etat,
        idClasse: idClasse ? Number(idClasse) : null,
        enseignantTitulaireId: enseignantTitulaireId ? Number(enseignantTitulaireId) : null,
      }
    });
    res.status(201).json(salle);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création de la salle" });
  }
};

export const getAllSalles = async (req: Request, res: Response): Promise<void> => {
  try {
    const salles = await prisma.salle.findMany({
      include: {
        classe: true,
        titulaire: { select: { id: true, nom: true, prenom: true } },
        _count: { select: { eleves: true } }
      }
    });
    res.json(salles);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération des salles" });
  }
};

export const updateEtatSalle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { etat } = req.body;
  try {
    const salle = await prisma.salle.update({
      where: { idSalle: Number(id) },
      data: { etat }
    });
    res.json(salle);
  } catch (error) {
    res.status(500).json({ error: "Erreur de mise à jour de l'état" });
  }
};

export const updatePositionSalle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { position } = req.body;
  try {
    const salle = await prisma.salle.update({
      where: { idSalle: Number(id) },
      data: { position }
    });
    res.json(salle);
  } catch (error) {
    res.status(500).json({ error: "Erreur de mise à jour de la position" });
  }
};

export const updateSalle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { libelle, position, capacite, etat, idClasse, enseignantTitulaireId } = req.body;
  try {
    const salle = await prisma.salle.update({
      where: { idSalle: Number(id) },
      data: {
        ...(libelle && { libelle }),
        ...(position !== undefined && { position }),
        ...(capacite !== undefined && { capacite: Number(capacite) }),
        ...(etat && { etat }),
        ...(idClasse !== undefined && { idClasse: idClasse ? Number(idClasse) : null }),
        ...(enseignantTitulaireId !== undefined && { enseignantTitulaireId: enseignantTitulaireId ? Number(enseignantTitulaireId) : null }),
      },
      include: {
        classe: true,
        titulaire: { select: { id: true, nom: true, prenom: true } },
        _count: { select: { eleves: true } },
      },
    });
    res.json(salle);
  } catch (error) {
    res.status(500).json({ error: "Erreur de mise à jour de la salle" });
  }
};

export const deleteSalle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.salle.delete({ where: { idSalle: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erreur de suppression de la salle" });
  }
};
