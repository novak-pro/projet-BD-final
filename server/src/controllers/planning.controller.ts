import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createPlanning = async (req: Request, res: Response) => {
  try {
    const { idCours, idSalle, jour, heureDebut, heureFin } = req.body;

    // 1. Vérifier si la salle est libre sur ce créneau
    const conflitSalle = await prisma.emploiDuTemps.findFirst({
      where: {
        idSalle: Number(idSalle),
        jour: jour,
        AND: [
          { heureDebut: { lte: heureFin } },
          { heureFin: { gte: heureDebut } }
        ]
      }
    });

    if (conflitSalle) {
      return res.status(400).json({ error: "La salle est déjà occupée à cette heure." });
    }

    // 2. Créer le créneau
    const planning = await prisma.emploiDuTemps.create({
      data: {
        idCours: Number(idCours),
        idSalle: Number(idSalle),
        jour,
        heureDebut,
        heureFin
      }
    });

    res.status(201).json(planning);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du planning" });
  }
};

// Récupérer l'emploi du temps d'une classe (Pour les Parents)
export const getPlanningByClasse = async (req: Request, res: Response) => {
  const { idClasse } = req.params;
  try {
    const edt = await prisma.emploiDuTemps.findMany({
      where: { cours: { idClasse: Number(idClasse) } },
      include: {
        salle: true,
        cours: {
          include: {
            matiere: true,
            enseignant: true
          }
        }
      },
      orderBy: { heureDebut: 'asc' }
    });
    res.json(edt);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

export const updatePlanning = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { idCours, idSalle, jour, heureDebut, heureFin } = req.body;

    // Vérifier conflit salle (exclure ce créneau)
    const conflit = await prisma.emploiDuTemps.findFirst({
      where: {
        idSalle: Number(idSalle),
        jour,
        id: { not: Number(id) },
        AND: [
          { heureDebut: { lte: heureFin } },
          { heureFin: { gte: heureDebut } },
        ],
      },
    });

    if (conflit) {
      return res.status(400).json({ error: "La salle est déjà occupée à cette heure." });
    }

    const planning = await prisma.emploiDuTemps.update({
      where: { id: Number(id) },
      data: {
        idCours: Number(idCours),
        idSalle: Number(idSalle),
        jour,
        heureDebut,
        heureFin,
      },
    });

    res.json(planning);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
};

export const deletePlanning = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.emploiDuTemps.delete({ where: { id: Number(id) } });
    res.json({ message: "Créneau supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

export const getCoursByClasse = async (req: Request, res: Response) => {
  try {
    const { idClasse } = req.params;
    const cours = await prisma.cours.findMany({
      where: { idClasse: Number(idClasse) },
      include: { matiere: true, enseignant: true }
    });
    res.json(cours);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération des cours" });
  }
};

// Récupérer l'emploi du temps d'une salle
export const getPlanningBySalle = async (req: Request, res: Response) => {
  const { idSalle } = req.params;
  try {
    const edt = await prisma.emploiDuTemps.findMany({
      where: { idSalle: Number(idSalle) },
      include: {
        salle: true,
        cours: {
          include: { matiere: true, enseignant: true }
        }
      },
      orderBy: { heureDebut: 'asc' }
    });
    res.json(edt);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

// Récupérer les cours disponibles pour une salle
export const getCoursBySalle = async (req: Request, res: Response) => {
  try {
    const { idSalle } = req.params;
    // Cours liés à cette salle, ou cours sans classe qui n'ont pas de salle assignée
    const cours = await prisma.cours.findMany({
      where: {
        OR: [
          { idSalle: Number(idSalle) },
          { idSalle: null, idClasse: null },
        ]
      },
      include: { matiere: true, enseignant: true }
    });
    res.json(cours);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération des cours" });
  }
};

export const getPlanningByEleve = async (req: Request, res: Response) => {
  const { eleveId } = req.params;
  try {
    const eleve = await prisma.eleve.findUnique({
      where: { matricule: Number(eleveId) },
      select: { classroomId: true }
    });
    if (!eleve || !eleve.classroomId) {
      res.json([]);
      return;
    }
    const edt = await prisma.emploiDuTemps.findMany({
      where: { cours: { idClasse: eleve.classroomId } },
      include: {
        salle: true,
        cours: {
          include: { matiere: true, enseignant: true }
        }
      },
      orderBy: { heureDebut: 'asc' }
    });
    res.json(edt);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};