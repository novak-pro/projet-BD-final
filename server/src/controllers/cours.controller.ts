import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getMesCours = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const personnel = await prisma.personnel.findUnique({ where: { userId } });
    if (!personnel) return res.status(403).json({ error: "Profil enseignant non trouvé" });

    const cours = await prisma.cours.findMany({
      where: { enseignantId: personnel.id },
      include: {
        matiere: true,
        classe: {
          include: {
            _count: { select: { students: true } },
            cycle: true,
          },
        },
        plannings: {
          include: { salle: true },
          orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
        },
      },
      orderBy: { idCours: 'asc' },
    });

    res.json(cours);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération des cours" });
  }
};

export const getCoursDetail = async (req: Request, res: Response) => {
  try {
    const coursId = parseInt(req.params.id as string);
    const userId = (req as any).user.id;

    const personnel = await prisma.personnel.findUnique({ where: { userId } });
    if (!personnel) return res.status(403).json({ error: "Profil enseignant non trouvé" });

    const cours = await prisma.cours.findFirst({
      where: { idCours: coursId, enseignantId: personnel.id },
      include: {
        matiere: true,
        classe: {
          include: {
            cycle: true,
            students: {
              orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
              include: {
                notes: {
                  include: { matiere: true },
                  orderBy: { dateSaisie: 'desc' },
                },
                evaluations: {
                  where: { idCours: coursId },
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        },
        plannings: {
          include: { salle: true },
          orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
        },
      },
    });

    if (!cours) return res.status(404).json({ error: "Cours non trouvé" });

    res.json(cours);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération du cours" });
  }
};

export const getMesEleves = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const personnel = await prisma.personnel.findUnique({ where: { userId } });
    if (!personnel) return res.status(403).json({ error: "Profil enseignant non trouvé" });

    const cours = await prisma.cours.findMany({
      where: { enseignantId: personnel.id },
      include: {
        classe: {
          include: {
            students: {
              orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
              select: { matricule: true, nom: true, prenom: true, photoURL: true },
            },
          },
        },
      },
    });

    const studentsMap = new Map<number, { matricule: number; nom: string; prenom: string; photoURL: string | null }>();
    for (const c of cours) {
      if (!c.classe) continue;
      for (const s of c.classe.students) {
        if (!studentsMap.has(s.matricule)) {
          studentsMap.set(s.matricule, s);
        }
      }
    }

    res.json(Array.from(studentsMap.values()));
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération des élèves" });
  }
};
