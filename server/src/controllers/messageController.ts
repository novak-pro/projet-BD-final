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

// Enseignant envoie un message (statut PENDING, doit être approuvé par admin)
export const sendTeacherMessage = async (req: Request, res: Response) => {
  try {
    const { content, recipientId } = req.body;
    const senderId = (req as any).user.id;

    const message = await prisma.message.create({
      data: {
        content,
        type: 'PERSONAL',
        status: 'PENDING',
        senderId,
        recipientId,
      },
    });

    res.status(201).json({ message: 'Message soumis pour validation', data: message });
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
