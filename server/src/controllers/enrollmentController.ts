import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Un parent soumet une demande d'inscription
export const submitEnrollment = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, dateNaissance, lieuNaissance, sexe } = req.body;
    const userId = (req as any).user.id; // ID provenant du JWT

    // Trouver le profil Parent associé à l'utilisateur
    const parent = await prisma.parents.findUnique({ where: { userId } });
    if (!parent) return res.status(403).json({ error: "Profil parent non trouvé" });

    const demande = await prisma.enrollmentRequest.create({
      data: {
        nom,
        prenom,
        dateNaissance: new Date(dateNaissance),
        lieuNaissance,
        sexe: parseInt(sexe),
        niveau: req.body.niveau,
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
  const { status, adminNotes } = req.body; // status: 'APPROVED' ou 'REJECTED'

  try {
    const request = await prisma.enrollmentRequest.findUnique({ 
      where: { id: parseInt(id as string) } 
    });

    if (!request || request.status !== 'PENDING') {
      return res.status(400).json({ error: "Demande introuvable ou déjà traitée" });
    }

    // Transaction : Mise à jour de la demande + Création de l'élève si approuvé
    const result = await prisma.$transaction(async (tx) => {
      const updatedReq = await tx.enrollmentRequest.update({
        where: { id: parseInt(id as string) },
        data: { status, adminNotes }
      });

      if (status === 'APPROVED') {
        await tx.eleve.create({
          data: {
            nom: request.nom,
            prenom: request.prenom,
            dateNaissance: request.dateNaissance,
            lieuNaissance: request.lieuNaissance,
            sexe: request.sexe,
            parentId: request.parentId,
            niveau:        request.niveau,
            statut: "Inscrit"
          }
        });
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