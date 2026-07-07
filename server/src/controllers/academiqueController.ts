import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// ── Helper : vérifie qu'aucune année existante ne chevauche les dates données ──
const checkOverlap = async (debut: Date, fin: Date, excludeId?: number): Promise<string | null> => {
  const overlapping = await prisma.anneeAcademique.findFirst({
    where: {
      idAcademi: excludeId ? { not: excludeId } : undefined,
      AND: [
        { dateDebut: { lt: fin } },
        { dateFin: { gt: debut } },
      ],
    },
  });
  if (overlapping) {
    return `Les dates chevauchent l'année "${overlapping.libelle}" (${overlapping.dateDebut.toISOString().split('T')[0]} → ${overlapping.dateFin.toISOString().split('T')[0]})`;
  }
  return null;
};

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

    // Statistiques via Frequente (élèves inscrits, classes actives)
    const statsRaw: { idacademi: number; elevescount: bigint; classescount: bigint }[] =
      await prisma.$queryRawUnsafe(`
        SELECT "idAcademi", COUNT(DISTINCT "idEleve") as elevesCount, COUNT(DISTINCT "idSalle") as classesCount
        FROM "Frequente"
        GROUP BY "idAcademi"
      `);
    const statsMap = new Map<number, { elevesCount: number; classesCount: number }>();
    for (const s of statsRaw) {
      statsMap.set(s.idacademi, { elevesCount: Number(s.elevescount), classesCount: Number(s.classescount) });
    }

    const result = annees.map(a => ({
      ...a,
      elevesCount: statsMap.get(a.idAcademi)?.elevesCount ?? 0,
      classesCount: statsMap.get(a.idAcademi)?.classesCount ?? 0,
    }));

    res.json(result);
  } catch (error) {
    console.error("getAllAnnees error:", error);
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

export const getActiveAnnee = async (req: Request, res: Response) => {
  try {
    let annee = await prisma.anneeAcademique.findFirst({
      where: { active: true },
      include: {
        trimestres: {
          orderBy: { idTrimestre: 'asc' },
        },
      },
    });
    if (!annee) {
      annee = await prisma.anneeAcademique.findFirst({
        where: { statut: 'EN_COURS' },
        include: {
          trimestres: {
            orderBy: { idTrimestre: 'asc' },
          },
        },
      });
    }
    if (!annee) return res.status(404).json({ error: "Aucune année académique active" });
    res.json(annee);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

export const createAnnee = async (req: Request, res: Response) => {
  try {
    const { libelle, dateDebut, dateFin } = req.body;
    if (!libelle || !dateDebut || !dateFin) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({ error: "Dates invalides" });
    }
    if (debut >= fin) {
      return res.status(400).json({ error: "La date de fin doit être postérieure à la date de début" });
    }
    const overlap = await checkOverlap(debut, fin);
    if (overlap) return res.status(409).json({ error: overlap });

    const now = new Date();
    let statut: 'PREVUE' | 'EN_COURS' | 'TERMINEE' = 'PREVUE';
    if (fin < now) statut = 'TERMINEE';
    else if (debut <= now) statut = 'EN_COURS';

    const annee = await prisma.anneeAcademique.create({
      data: { libelle, dateDebut: debut, dateFin: fin, statut },
    });
    res.status(201).json(annee);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: "Cette année académique existe déjà" });
    }
    console.error("createAnnee error:", error);
    res.status(500).json({ error: "Erreur de création" });
  }
};

export const updateAnnee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { libelle, dateDebut, dateFin, active, statut } = req.body;
    const data: any = {};
    if (libelle !== undefined) data.libelle = libelle;
    if (dateDebut !== undefined) {
      const d = new Date(dateDebut);
      if (isNaN(d.getTime())) return res.status(400).json({ error: "Date de début invalide" });
      data.dateDebut = d;
    }
    if (dateFin !== undefined) {
      const d = new Date(dateFin);
      if (isNaN(d.getTime())) return res.status(400).json({ error: "Date de fin invalide" });
      data.dateFin = d;
    }
    if (active !== undefined) data.active = active;
    if (statut !== undefined) data.statut = statut;
    if (data.dateDebut || data.dateFin) {
      const existing = await prisma.anneeAcademique.findUnique({ where: { idAcademi: id } });
      if (existing) {
        const newDebut = data.dateDebut || existing.dateDebut;
        const newFin = data.dateFin || existing.dateFin;
        if (newDebut >= newFin) return res.status(400).json({ error: "La date de fin doit être postérieure à la date de début" });
        const overlap = await checkOverlap(newDebut, newFin, id);
        if (overlap) return res.status(409).json({ error: overlap });
      }
    }
    const annee = await prisma.anneeAcademique.update({
      where: { idAcademi: id },
      data,
    });
    res.json(annee);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: "Cette année académique existe déjà" });
    }
    console.error("updateAnnee error:", error);
    res.status(500).json({ error: "Erreur de mise à jour" });
  }
};

export const deleteAnnee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const annee = await prisma.anneeAcademique.findUnique({ where: { idAcademi: id } });
    if (!annee) return res.status(404).json({ error: "Année non trouvée" });
    if (annee.active) return res.status(400).json({ error: "Impossible de supprimer l'année académique active. Veuillez d'abord en activer une autre." });
    await prisma.anneeAcademique.delete({ where: { idAcademi: id } });
    res.status(204).send();
  } catch (error) {
    console.error("deleteAnnee error:", error);
    res.status(500).json({ error: "Erreur de suppression" });
  }
};

export const duplicateAnnee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { libelle, dateDebut, dateFin } = req.body;
    if (!libelle || !dateDebut || !dateFin) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({ error: "Dates invalides" });
    }
    if (debut >= fin) {
      return res.status(400).json({ error: "La date de fin doit être postérieure à la date de début" });
    }

    // Vérifier que l'original existe
    const original = await prisma.anneeAcademique.findUnique({
      where: { idAcademi: id },
      include: { trimestres: { include: { sessions: true } } },
    });
    if (!original) return res.status(404).json({ error: "Année source non trouvée" });

    // Vérifier chevauchement
    const overlap = await checkOverlap(debut, fin);
    if (overlap) return res.status(409).json({ error: overlap });

    // Créer la nouvelle année avec duplication des trimestres et sessions
    const now = new Date();
    let statut: 'PREVUE' | 'EN_COURS' | 'TERMINEE' = 'PREVUE';
    if (fin < now) statut = 'TERMINEE';
    else if (debut <= now) statut = 'EN_COURS';

    const newAnnee = await prisma.anneeAcademique.create({
      data: {
        libelle,
        dateDebut: debut,
        dateFin: fin,
        statut,
        trimestres: {
          create: original.trimestres.map(tri => ({
            libelle: tri.libelle,
            dateDebut: tri.dateDebut,
            dateFin: tri.dateFin,
            sessions: {
              create: tri.sessions.map(ses => ({
                libelle: ses.libelle,
                dateDebut: ses.dateDebut,
                dateFin: ses.dateFin,
              })),
            },
          })),
        },
      },
      include: { trimestres: { include: { sessions: true } } },
    });

    res.status(201).json(newAnnee);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: "Cette année académique existe déjà" });
    }
    console.error("duplicateAnnee error:", error);
    res.status(500).json({ error: "Erreur de duplication" });
  }
};

export const generateTrimestres = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const annee = await prisma.anneeAcademique.findUnique({
      where: { idAcademi: id },
      include: { trimestres: true },
    });
    if (!annee) return res.status(404).json({ error: "Année non trouvée" });

    if (annee.trimestres.length > 0) {
      return res.status(400).json({ error: "Cette année a déjà des trimestres" });
    }

    // Découper l'année en 3 périodes égales
    const yearStart = new Date(annee.dateDebut);
    const yearEnd = new Date(annee.dateFin);
    const third = (yearEnd.getTime() - yearStart.getTime()) / 3;

    const t1Start = new Date(yearStart);
    const t1End = new Date(yearStart.getTime() + third);
    const t2Start = new Date(t1End);
    const t2End = new Date(yearStart.getTime() + 2 * third);
    const t3Start = new Date(t2End);

    // Pour les sessions, placer Devoirs à 30% du trimestre, Examens à 70%
    const triDuration = (triStart: Date, triEnd: Date) => triEnd.getTime() - triStart.getTime();

    const mkSession = (triStart: Date, triEnd: Date) => {
      const dur = triDuration(triStart, triEnd);
      return [
        { libelle: "Devoirs", dateDebut: new Date(triStart.getTime() + dur * 0.3) },
        { libelle: "Examens", dateDebut: new Date(triStart.getTime() + dur * 0.7), dateFin: new Date(triEnd) },
      ];
    };

    const trimestresData = [
      { libelle: "Trimestre 1", dateDebut: t1Start, dateFin: t1End, sessions: { create: mkSession(t1Start, t1End) } },
      { libelle: "Trimestre 2", dateDebut: t2Start, dateFin: t2End, sessions: { create: mkSession(t2Start, t2End) } },
      { libelle: "Trimestre 3", dateDebut: t3Start, dateFin: yearEnd, sessions: { create: mkSession(t3Start, yearEnd) } },
    ];

    await prisma.anneeAcademique.update({
      where: { idAcademi: id },
      data: {
        trimestres: { create: trimestresData },
      },
      include: { trimestres: { include: { sessions: true } } },
    });

    // Re-fetch pour retourner les données complètes
    const updated = await prisma.anneeAcademique.findUnique({
      where: { idAcademi: id },
      include: { trimestres: { include: { sessions: true } } },
    });
    res.status(201).json(updated);
  } catch (error) {
    console.error("generateTrimestres error:", error);
    res.status(500).json({ error: "Erreur de génération" });
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
    const { libelle, idAcademi, dateDebut, dateFin } = req.body;
    const data: any = { libelle, idAcademi: parseInt(idAcademi) };
    if (dateDebut) data.dateDebut = new Date(dateDebut);
    if (dateFin) data.dateFin = new Date(dateFin);
    const trimestre = await prisma.trimestre.create({ data });
    res.status(201).json(trimestre);
  } catch (error) {
    console.error("createTrimestre error:", error);
    res.status(500).json({ error: "Erreur de création du trimestre" });
  }
};

export const updateTrimestre = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { libelle, dateDebut, dateFin } = req.body;
    const data: any = {};
    if (libelle !== undefined) data.libelle = libelle;
    if (dateDebut !== undefined) data.dateDebut = new Date(dateDebut);
    if (dateFin !== undefined) data.dateFin = new Date(dateFin);
    const trimestre = await prisma.trimestre.update({
      where: { idTrimestre: id },
      data,
    });
    res.json(trimestre);
  } catch (error) {
    console.error("updateTrimestre error:", error);
    res.status(500).json({ error: "Erreur de mise à jour du trimestre" });
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
    const { libelle, idTrimestre, dateDebut, dateFin } = req.body;
    const data: any = { libelle, idTrimestre: parseInt(idTrimestre) };
    if (dateDebut) data.dateDebut = new Date(dateDebut);
    if (dateFin) data.dateFin = new Date(dateFin);
    const session = await prisma.session.create({ data });
    res.status(201).json(session);
  } catch (error) {
    console.error("createSession error:", error);
    res.status(500).json({ error: "Erreur de création de la session" });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { libelle, dateDebut, dateFin } = req.body;
    const data: any = {};
    if (libelle !== undefined) data.libelle = libelle;
    if (dateDebut !== undefined) data.dateDebut = new Date(dateDebut);
    if (dateFin !== undefined) data.dateFin = new Date(dateFin);
    const session = await prisma.session.update({
      where: { idSession: id },
      data,
    });
    res.json(session);
  } catch (error) {
    console.error("updateSession error:", error);
    res.status(500).json({ error: "Erreur de mise à jour de la session" });
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
