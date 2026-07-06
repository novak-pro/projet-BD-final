import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * 1. Récupère les informations tarifaires d'un élève selon son niveau
 */
export const getStudentFeeConfig = async (req: Request, res: Response) => {
  try {
    const { matricule } = req.params;

    const eleve = await prisma.eleve.findUnique({
      where: { matricule: parseInt(matricule as string) },
      select: { niveau: true }
    });

    if (!eleve) return res.status(404).json({ error: "Élève non trouvé" });

    const config = await prisma.feeConfig.findUnique({
      where: { niveau: eleve.niveau }
    });

    if (!config) return res.status(404).json({ error: "Tarif non configuré pour ce niveau" });

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des tarifs" });
  }
};

/**
 * 2. Création d'une demande de paiement par le parent
 */
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { eleveId, nombreTranches, methode, transactionRef, montant, recuPDF, modePaiement } = req.body;
    const userId = (req as any).user.id;

    // Trouver le profil parent
    const parent = await prisma.parents.findUnique({ where: { userId } });
    if (!parent) return res.status(403).json({ error: "Profil parent introuvable" });

    const payment = await prisma.payment.create({
      data: {
        montant: parseFloat(montant),
        nombreTranches: parseInt(nombreTranches),
        methode: methode as PaymentMethod,
        recuPDF: recuPDF || null,
        modePaiement: modePaiement || null,
        transactionRef,
        eleveId: parseInt(eleveId),
        parentId: parent.id,
        status: PaymentStatus.PENDING
      }
    });

    res.status(201).json({ message: "Paiement soumis avec succès", payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Échec de l'enregistrement du paiement" });
  }
};

/**
 * 3. Validation par l'Admin
 */
export const validatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body; // status: 'VALIDATED' | 'REJECTED'

    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id as string) },
      data: { 
        status: status as PaymentStatus, 
        adminNotes,
        updatedAt: new Date()
      }
    });

    res.json({ message: `Paiement ${status}`, updatedPayment });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la validation" });
  }
};

/**
 * 4. Liste des paiements (Filtre automatique Parent/Admin)
 */
export const getPayments = async (req: Request, res: Response) => {
  const { id, role } = (req as any).user;

  try {
    let whereClause = {};
    
    if (role === 'PARENT') {
      const parent = await prisma.parents.findUnique({ where: { userId: id } });
      whereClause = { parentId: parent?.id };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: { 
        eleve: { select: { nom: true, prenom: true, niveau: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

/**
 * 5. Récupérer toutes les configurations de frais (Admin)
 */
export const getAllFeeConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await prisma.feeConfig.findMany({ orderBy: { niveau: 'asc' } });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

/**
 * 6. Créer une configuration de frais (Admin)
 */
export const createFeeConfig = async (req: Request, res: Response) => {
  try {
    const { niveau, montantTotal, montantTranche } = req.body;
    const config = await prisma.feeConfig.create({
      data: { niveau, montantTotal: parseFloat(montantTotal), montantTranche: parseFloat(montantTranche) }
    });
    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};