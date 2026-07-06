import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 1. Un parent soumet une demande d'inscription
export const submitEnrollment = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, dateNaissance, lieuNaissance, sexe, niveau, classe, photoURL, recuPDF, modePaiement } = req.body;
    const userId = (req as any).user.id;

    const parent = await prisma.parents.findUnique({ where: { userId } });
    if (!parent) return res.status(403).json({ error: "Profil parent non trouvé" });

    const demande = await prisma.enrollmentRequest.create({
      data: {
        nom,
        prenom,
        dateNaissance: new Date(dateNaissance),
        lieuNaissance,
        sexe: parseInt(sexe),
        niveau,
        classe: classe || null,
        photoURL: photoURL || null,
        recuPDF: recuPDF || null,
        modePaiement: modePaiement || null,
        parentId: parent.id
      }
    });

    res.status(201).json({ message: "Demande soumise avec succès", demande });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la soumission" });
  }
};

// 2. L'Admin valide ou refuse la demande
export const processEnrollment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes, classroomId } = req.body; // status: 'APPROVED' ou 'REJECTED'

  try {
    const request = await prisma.enrollmentRequest.findUnique({ 
      where: { id: parseInt(id as string) } 
    });

    if (!request || request.status !== 'PENDING') {
      return res.status(400).json({ error: "Demande introuvable ou déjà traitée" });
    }

    // Récupérer l'année académique active pour Frequente
    const activeAnnee = await prisma.anneeAcademique.findFirst({ where: { active: true } });

    // Transaction : Mise à jour de la demande + Création de l'élève si approuvé
    const result = await prisma.$transaction(async (tx) => {
      const updatedReq = await tx.enrollmentRequest.update({
        where: { id: parseInt(id as string) },
        data: { status, adminNotes }
      });

      if (status === 'APPROVED') {
        const eleve = await tx.eleve.create({
          data: {
            nom: request.nom,
            prenom: request.prenom,
            dateNaissance: request.dateNaissance,
            lieuNaissance: request.lieuNaissance,
            sexe: request.sexe,
            photoURL: request.photoURL,
            parentId: request.parentId,
            niveau: request.niveau,
            classroomId: classroomId ? parseInt(classroomId) : null,
            statut: "Inscrit"
          }
        });

        // Créer l'entrée Frequente (affectation élève → classe)
        if (classroomId && activeAnnee) {
          await tx.frequente.create({
            data: {
              idEleve: eleve.matricule,
              idSalle: parseInt(classroomId),
              idAcademi: activeAnnee.idAcademi,
            }
          });
        }
      }
      return updatedReq;
    });

    res.json({ message: `Demande ${status.toLowerCase()}`, data: result });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du traitement de la demande" });
  }
};

// 3. Récupérer les demandes (Admin voit tout, Parent voit les siennes)
export const getEnrollments = async (req: Request, res: Response) => {
  const { id, role } = (req as any).user;

  try {
    if (role === 'ADMIN_PRINCIPAL') {
      const all = await prisma.enrollmentRequest.findMany({
        include: { parent: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(all);
    } else {
      const parent = await prisma.parents.findUnique({ where: { userId: id } });
      const mine = await prisma.enrollmentRequest.findMany({
        where: { parentId: parent?.id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(mine);
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

// 4. Récupérer les enfants d'un parent connecté
export const getMyChildren = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const parent = await prisma.parents.findUnique({
      where: { userId },
      include: {
        enfants: {
          select: {
            matricule: true,
            nom: true,
            prenom: true,
            niveau: true,
            photoURL: true,
            classroomId: true
          }
        }
      }
    });
    if (!parent) return res.status(403).json({ error: "Profil parent non trouvé" });
    res.json(parent.enfants);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération des enfants" });
  }
};

// 5. Profil complet d'un enfant (pour le parent)
export const getChildProfile = async (req: Request, res: Response) => {
  try {
    const matricule = req.params.matricule as string;
    const userId = (req as any).user.id;

    const child = await prisma.eleve.findUnique({
      where: { matricule: parseInt(matricule) },
      include: {
        classroom: {
          include: {
            cycle: true,
            responsable: true,
            cours: {
              include: {
                matiere: true,
                enseignant: true,
              },
            },
          },
        },
        salle: true,
        notes: {
          include: { matiere: true },
          orderBy: { dateSaisie: 'desc' },
        },
        incidents: {
          orderBy: { date: 'desc' },
        },
        evaluations: {
          include: { cours: { include: { matiere: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!child) return res.status(404).json({ error: 'Enfant non trouvé' });

    const parent = await prisma.parents.findUnique({ where: { userId } });
    if (!parent || child.parentId !== parent.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(child);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de récupération du profil' });
  }
};

// 6. Upload photo enfant (base64)
export const updateChildPhoto = async (req: Request, res: Response) => {
  try {
    const matricule = req.params.matricule as string;
    const { photoURL } = req.body;
    const userId = (req as any).user.id;

    const child = await prisma.eleve.findUnique({ where: { matricule: parseInt(matricule) } });
    if (!child) return res.status(404).json({ error: 'Enfant non trouvé' });

    const parent = await prisma.parents.findUnique({ where: { userId } });
    if (!parent || child.parentId !== parent.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await prisma.eleve.update({
      where: { matricule: parseInt(matricule) },
      data: { photoURL },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de mise à jour de la photo' });
  }
};

// 7. Mettre à jour les infos scolaires d'un enfant (parent)
export const updateChildSchoolInfo = async (req: Request, res: Response) => {
  try {
    const matricule = req.params.matricule as string;
    const { niveau, classroomId, salleId } = req.body;
    const userId = (req as any).user.id;

    const child = await prisma.eleve.findUnique({ where: { matricule: parseInt(matricule) } });
    if (!child) return res.status(404).json({ error: 'Enfant non trouvé' });

    const parent = await prisma.parents.findUnique({ where: { userId } });
    if (!parent || child.parentId !== parent.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await prisma.eleve.update({
      where: { matricule: parseInt(matricule) },
      data: {
        ...(niveau !== undefined && { niveau }),
        ...(classroomId !== undefined && { classroomId: classroomId ? parseInt(classroomId) : null }),
        ...(salleId !== undefined && { salleId: salleId ? parseInt(salleId) : null }),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de mise à jour des informations scolaires' });
  }
};

// 8. Mettre à jour les infos scolaires d'un enfant (admin)
export const updateChildSchoolInfoAdmin = async (req: Request, res: Response) => {
  try {
    const matricule = req.params.matricule as string;
    const { niveau, classroomId, salleId, statut } = req.body;

    const updated = await prisma.eleve.update({
      where: { matricule: parseInt(matricule) },
      data: {
        ...(niveau !== undefined && { niveau }),
        ...(classroomId !== undefined && { classroomId: classroomId ? parseInt(classroomId) : null }),
        ...(salleId !== undefined && { salleId: salleId ? parseInt(salleId) : null }),
        ...(statut !== undefined && { statut }),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de mise à jour' });
  }
};

// 8.5 Cycles CRUD
export const getCycles = async (_req: Request, res: Response) => {
  try {
    const cycles = await prisma.cycle.findMany({
      orderBy: { libelle: 'asc' },
      include: { _count: { select: { classes: true } } },
    });
    res.json(cycles);
  } catch {
    res.status(500).json({ error: "Erreur de récupération des cycles" });
  }
};

export const createCycle = async (req: Request, res: Response) => {
  try {
    const { libelle, description } = req.body;
    if (!libelle) {
      res.status(400).json({ error: "Le libellé est requis" });
      return;
    }
    const cycle = await prisma.cycle.create({
      data: { libelle, description: description ?? null },
    });
    res.status(201).json(cycle);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: "Ce cycle existe déjà" });
      return;
    }
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

export const updateCycle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { libelle, description } = req.body;
    const cycle = await prisma.cycle.update({
      where: { idCycle: id },
      data: {
        ...(libelle && { libelle }),
        ...(description !== undefined && { description }),
      },
    });
    res.json(cycle);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

export const deleteCycle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const cycle = await prisma.cycle.findUnique({
      where: { idCycle: id },
      include: { _count: { select: { classes: true } } },
    });
    if (!cycle) {
      res.status(404).json({ error: "Cycle non trouvé" });
      return;
    }
    if (cycle._count.classes > 0) {
      res.status(400).json({ error: "Impossible de supprimer : des classes sont liées à ce cycle" });
      return;
    }
    await prisma.cycle.delete({ where: { idCycle: id } });
    res.json({ message: "Cycle supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

// 9. Classes CRUD
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.classe.findMany({
      include: { cycle: true, _count: { select: { students: true } } },
      orderBy: { libelle: 'asc' }
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération des classes" });
  }
};

export const createClasse = async (req: Request, res: Response) => {
  try {
    const { libelle, idCycle } = req.body;
    if (!libelle) {
      res.status(400).json({ error: "Le libellé est requis" });
      return;
    }
    const classe = await prisma.classe.create({
      data: { libelle, idCycle: Number(idCycle) || 1 },
      include: { cycle: true },
    });
    res.status(201).json(classe);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: "Cette classe existe déjà" });
      return;
    }
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

export const updateClasse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { libelle, idCycle } = req.body;
    const classe = await prisma.classe.update({
      where: { idClasse: id },
      data: { ...(libelle && { libelle }), ...(idCycle && { idCycle: Number(idCycle) }) },
      include: { cycle: true },
    });
    res.json(classe);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

export const deleteClasse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    // Vérifier si la classe a des élèves ou des salles liées
    const classe = await prisma.classe.findUnique({
      where: { idClasse: id },
      include: { _count: { select: { students: true, salles: true, cours: true } } },
    });
    if (!classe) {
      res.status(404).json({ error: "Classe non trouvée" });
      return;
    }
    if (classe._count.students > 0 || classe._count.salles > 0 || classe._count.cours > 0) {
      res.status(400).json({ error: "Impossible de supprimer : la classe a des élèves, salles ou cours associés" });
      return;
    }
    await prisma.classe.delete({ where: { idClasse: id } });
    res.json({ message: "Classe supprimée" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};