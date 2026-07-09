import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Admin envoie une annonce (à tous les parents)
export const sendAnnouncement = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const senderId = (req as any).user.id;

    const parents = await prisma.parents.findMany({ select: { userId: true } });

    await prisma.message.createMany({
      data: parents.map(p => ({
        content,
        type: 'ANNOUNCEMENT',
        status: 'SENT',
        senderId,
        recipientId: p.userId,
      })),
    });

    res.status(201).json({ message: 'Annonce envoyée à tous les parents' });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'envoi de l'annonce" });
  }
};

// Admin envoie un message personnel à un parent spécifique
export const sendPersonalMessage = async (req: Request, res: Response) => {
  try {
    const { content, recipientId } = req.body;
    const senderId = (req as any).user.id;

    const message = await prisma.message.create({
      data: {
        content,
        type: 'PERSONAL',
        status: 'SENT',
        senderId,
        recipientId,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
};

// Enseignant titulaire envoie un message aux parents des élèves de sa classe (statut PENDING, doit être approuvé par admin)
export const sendTeacherMessage = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const senderId = (req as any).user.id;

    // Récupérer le profil enseignant
    const personnel = await prisma.personnel.findUnique({
      where: { userId: senderId },
      include: {
        salleTitulaire: {
          include: {
            eleves: { include: { parent: true } },
            classe: true,
          },
        },
      },
    });

    if (!personnel) return res.status(404).json({ error: 'Profil enseignant introuvable' });
    if (!personnel.salleTitulaire || personnel.salleTitulaire.length === 0) {
      return res.status(403).json({ error: 'Vous devez être titulaire d\'une salle pour envoyer des messages aux parents' });
    }

    const salle = personnel.salleTitulaire[0];
    const parentUserIds = [
      ...new Set(salle.eleves.filter(e => e.parent?.userId).map(e => e.parent!.userId)),
    ];

    if (parentUserIds.length === 0) {
      return res.status(400).json({ error: 'Aucun parent trouvé pour les élèves de cette classe' });
    }

    await prisma.message.createMany({
      data: parentUserIds.map(recipientId => ({
        content,
        type: 'PERSONAL',
        status: 'PENDING',
        senderId,
        recipientId,
      })),
    });

    res.status(201).json({
      message: `Message soumis pour validation (envoyé à ${parentUserIds.length} parent(s))`,
      nbParents: parentUserIds.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
};

// Admin approuve ou rejette un message d'enseignant
export const moderateMessage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const updated = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de modération' });
  }
};

// Récupérer les messages (admin voit tous les PENDING, parent voit ses messages)
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id, role } = (req as any).user;

    if (role === 'ADMIN_PRINCIPAL') {
      const pending = await prisma.message.findMany({
        where: { status: 'PENDING' },
        include: {
          sender: { select: { id: true, email: true } },
          recipient: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(pending);
    }

    if (role === 'PERSONNEL') {
      const myMessages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: id },
            { recipientId: id },
          ],
        },
        include: {
          sender: { select: { id: true, email: true } },
          recipient: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(myMessages);
    }

    const messages = await prisma.message.findMany({
      where: { recipientId: id },
      include: {
        sender: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de récupération des messages' });
  }
};

// Récupérer les parents (pour le filtre admin)
export const getParentsList = async (_req: Request, res: Response) => {
  try {
    const parents = await prisma.parents.findMany({
      include: {
        user: { select: { id: true, email: true } },
      },
    });
    res.json(parents.map(p => ({ id: p.userId, nom: p.nom, prenom: p.prenom, email: p.user.email })));
  } catch (error) {
    res.status(500).json({ error: 'Erreur de récupération des parents' });
  }
};
