import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getBulletinComplet = async (req: Request, res: Response): Promise<void> => {
  const { matricule, evaluation } = req.query;

  try {
    const eleve = await prisma.eleve.findUnique({
      where: { matricule: Number(matricule) },
      include: {
        classroom: {
          include: {
            responsable: true,
            _count: { select: { students: true } },
          },
        },
        incidents: {
          where: {
            date: { gte: new Date(new Date().getFullYear(), 0, 1) },
          },
        },
      },
    });

    if (!eleve) {
      res.status(404).json({ error: "Élève non trouvé" });
      return;
    }

    const classId = eleve.classroomId;
    const effectif = eleve.classroom?._count?.students ?? 0;

    // Notes de l'élève avec les infos matiere/cours/enseignant
    const notes = await prisma.note.findMany({
      where: { eleveId: Number(matricule), evaluation: String(evaluation) },
      include: {
        matiere: {
          include: {
            cours: {
              where: classId ? { idClasse: classId } : undefined,
              include: { enseignant: true },
            },
          },
        },
      },
    });

    // Moyenne par matière pour toute la classe
    const allNotesClasse = classId ? await prisma.note.findMany({
      where: {
        evaluation: String(evaluation),
        eleve: { classroomId: classId },
      },
    }) : [];

    const moyenneParMatiere: Record<number, { sum: number; count: number }> = {};
    allNotesClasse.forEach(n => {
      if (!moyenneParMatiere[n.idMatiere]) moyenneParMatiere[n.idMatiere] = { sum: 0, count: 0 };
      moyenneParMatiere[n.idMatiere].sum += n.valeur;
      moyenneParMatiere[n.idMatiere].count += 1;
    });

    const details = notes.map((note) => {
      const cours = note.matiere.cours[0];
      const coeff = cours?.coefficient || 1;
      const enseignant = cours?.enseignant;
      const matStats = moyenneParMatiere[note.idMatiere];
      return {
        matiere: note.matiere.nom,
        valeur: note.valeur,
        coefficient: coeff,
        points: parseFloat((note.valeur * coeff).toFixed(2)),
        enseignant: enseignant ? `${enseignant.prenom} ${enseignant.nom}` : null,
        moyenneClasse: matStats ? parseFloat((matStats.sum / matStats.count).toFixed(2)) : null,
        appreciation: null,
      };
    });

    // Moyenne générale de l'élève
    let totalPoints = 0;
    let totalCoeffs = 0;
    notes.forEach(n => {
      const c = n.matiere.cours[0]?.coefficient || 1;
      totalPoints += n.valeur * c;
      totalCoeffs += c;
    });
    const moyenneGenerale = totalCoeffs > 0 ? parseFloat((totalPoints / totalCoeffs).toFixed(2)) : 0;

    // Calcul du rang et moyenne générale de la classe
    const bulletinsClasse = await calculerBulletinsClasseRaw(Number(classId), String(evaluation));
    const rang = bulletinsClasse.find(b => b.matricule === Number(matricule))?.rang ?? 0;
    const moyenneClasseGenerale = bulletinsClasse.length > 0
      ? parseFloat((bulletinsClasse.reduce((s, b) => s + b.moyenne, 0) / bulletinsClasse.length).toFixed(2))
      : 0;

    // Assiduité
    const absences = eleve.incidents.filter(i => i.type === 'ABSENCE_INJUSTIFIEE').length;
    const retards = eleve.incidents.filter(i => i.type === 'RETARD').length;

    res.json({
      eleve: {
        matricule: eleve.matricule,
        nom: eleve.nom,
        prenom: eleve.prenom,
        niveau: eleve.niveau,
      },
      classe: {
        libelle: eleve.classroom?.libelle ?? '',
        effectif,
        titulaire: eleve.classroom?.responsable
          ? { nom: eleve.classroom.responsable.nom, prenom: eleve.classroom.responsable.prenom }
          : null,
      },
      evaluation: String(evaluation),
      details,
      moyenneGenerale,
      rang,
      totalPoints: parseFloat(totalPoints.toFixed(2)),
      totalCoeffs,
      moyenneClasseGenerale,
      absences,
      retards,
    });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({ error: msg });
  }
};

async function calculerBulletinsClasseRaw(idClasse: number, evaluation: string) {
  const eleves = await prisma.eleve.findMany({
    where: { classroomId: idClasse },
    include: {
      notes: {
        where: { evaluation },
        include: {
          matiere: {
            include: {
              cours: { where: { idClasse } },
            },
          },
        },
      },
    },
  });

  const palmares = eleves.map(eleve => {
    let totalPoints = 0;
    let totalCoeffs = 0;
    eleve.notes.forEach(note => {
      const coeff = note.matiere.cours[0]?.coefficient || 1;
      totalPoints += note.valeur * coeff;
      totalCoeffs += coeff;
    });
    return {
      matricule: eleve.matricule,
      nom: eleve.nom,
      prenom: eleve.prenom,
      moyenne: totalCoeffs > 0 ? parseFloat((totalPoints / totalCoeffs).toFixed(2)) : 0,
    };
  });

  palmares.sort((a, b) => b.moyenne - a.moyenne);
  let rang = 1;
  return palmares.map((eleve, index) => {
    if (index > 0 && eleve.moyenne < palmares[index - 1].moyenne) rang = index + 1;
    return { ...eleve, rang };
  });
}

export const getDetailBulletin = async (req: Request, res: Response): Promise<void> => {
  const { matricule, evaluation } = req.query;

  try {
    const eleve = await prisma.eleve.findUnique({
      where: { matricule: Number(matricule) },
      select: { classroomId: true },
    });

    if (!eleve) {
      res.status(404).json({ error: "Élève non trouvé" });
      return;
    }

    const notes = await prisma.note.findMany({
      where: { eleveId: Number(matricule), evaluation: String(evaluation) },
      include: {
        matiere: {
          include: {
            cours: {
              where: eleve.classroomId ? { idClasse: eleve.classroomId } : undefined,
              include: { enseignant: true },
            },
          },
        },
      },
    });

    const details = notes.map((note) => {
      const cours = note.matiere.cours[0];
      const coeff = cours?.coefficient || 1;
      const enseignant = cours?.enseignant;
      return {
        matiere: note.matiere.nom,
        valeur: note.valeur,
        coefficient: coeff,
        points: parseFloat((note.valeur * coeff).toFixed(2)),
        enseignant: enseignant ? `${enseignant.prenom} ${enseignant.nom}` : null,
      };
    });

    res.json(details);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des détails" });
  }
};

export const calculerBulletinsClasse = async (req: Request, res: Response): Promise<void> => {
  const { idClasse, evaluation } = req.query;

  try {
    const eleves = await prisma.eleve.findMany({
      where: { classroomId: Number(idClasse) },
      include: {
        notes: {
          where: { evaluation: String(evaluation) },
          include: {
            matiere: {
              include: {
                cours: { where: { idClasse: Number(idClasse) } }
              }
            }
          }
        }
      }
    });

    // Calculer la moyenne de chaque élève
    let palmares = eleves.map(eleve => {
      let totalPoints = 0;
      let totalCoeffs = 0;

      eleve.notes.forEach(note => {
        const coeff = note.matiere.cours[0]?.coefficient || 1;
        totalPoints += note.valeur * coeff;
        totalCoeffs += coeff;
      });

      const moyenneGenerale = totalCoeffs > 0 ? (totalPoints / totalCoeffs) : 0;

      return {
        matricule: eleve.matricule,
        nom: eleve.nom,
        prenom: eleve.prenom,
        moyenne: parseFloat(moyenneGenerale.toFixed(2)),
        totalPoints,
        totalCoeffs
      };
    });

    // Trier par moyenne décroissante
    palmares.sort((a, b) => b.moyenne - a.moyenne);

    // ✅ Attribuer les rangs avec gestion des ex-æquo
    let rang = 1;
    const bulletinsAvecRangs = palmares.map((eleve, index) => {
      if (index > 0 && eleve.moyenne < palmares[index - 1].moyenne) {
        rang = index + 1; // Nouveau rang seulement si moyenne différente
      }
      return { ...eleve, rang };
    });

    // Exemple de résultat :
    // 15.00 → Rang 1
    // 15.00 → Rang 1  ← ex-æquo
    // 13.00 → Rang 3  ← pas Rang 2

    res.json(bulletinsAvecRangs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du calcul des bulletins" });
  }
};