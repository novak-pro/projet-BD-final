import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * INSCRIPTION (REGISTER)
 * Crée un utilisateur avec le statut 'PENDING' par défaut.
 */
export const register = async (req: Request, res: Response) => {
  const { email, password, role, nom, prenom, telephone, fonction } = req.body;

  try {
    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    // 2. Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Créer l'utilisateur et son profil associé en une seule transaction
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role, // 'PARENT' ou 'PERSONNEL'
        status: 'PENDING', // Toujours en attente selon le cahier des charges
        ...(role === 'PERSONNEL' ? {
          personnelProfile: {
            create: { nom, prenom, telephone, fonction: fonction || 'ADMINISTRATIF' }
          }
        } : {
          parentProfile: {
            create: { nom, prenom, telephone }
          }
        })
      }
    });

    res.status(201).json({ 
      message: "Demande d'inscription enregistrée. Un administrateur doit valider votre compte." 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création du compte." });
  }
};

/**
 * CONNEXION (LOGIN)
 * Vérifie les identifiants et le statut du compte.
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    // 2. Vérifier le STATUT (Cahier des charges)
    if (user.status === 'PENDING') {
      return res.status(403).json({ error: "Votre compte est en attente de validation par l'administration." });
    }
    if (user.status === 'DISABLED') {
      return res.status(403).json({ error: "Votre compte a été désactivé." });
    }

    // 3. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    // 4. Générer le Token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    // 5. Réponse
    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la connexion." });
  }
};
/**
 * PROFIL UTILISATEUR CONNECTÉ
 * Retourne les infos de l'utilisateur à partir du token
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id:               true,
        email:            true,
        role:             true,
        status:           true,
        personnelProfile: true,
        parentProfile:    true,
        adminProfile:     true,
      }
    });

    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable." });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du profil." });
  }
};