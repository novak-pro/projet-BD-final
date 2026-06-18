import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createSalle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { libelle, position, surface, capacite, etat, idClasse } = req.body;
    const salle = await prisma.salle.create({
      data: { 
        libelle, 
        position, 
        surface, 
        capacite, 
        etat,
        idClasse: Number(idClasse)  // ← obligatoire dans votre schéma
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
      include: { classe: true }  // ← inclut les infos de la classe liée
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
      where: { idSalle: Number(id) },  // ← virgule manquante corrigée
      data: { etat }
    });
    res.json(salle);
  } catch (error) {
    res.status(500).json({ error: "Erreur de mise à jour de l'état" });
  }
};