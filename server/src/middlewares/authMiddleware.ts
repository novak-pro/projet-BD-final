import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * MIDDLEWARE DE PROTECTION
 * Vérifie le token + existence user + statut ACTIVE
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!currentUser) {
        return res.status(401).json({ message: "Cet utilisateur n'existe plus." });
      }

      if (currentUser.status !== 'ACTIVE') {
        return res.status(403).json({
          message: "Compte en attente de validation ou désactivé."
        });
      }

      req.user = currentUser;
      next();

    } catch (error) {
      return res.status(401).json({ message: "Session expirée. Veuillez vous reconnecter." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Vous n'êtes pas connecté." });
  }
};

/**
 * RESTRICTION PAR RÔLE(S)
 * Usage : restrictTo('ADMIN_PRINCIPAL', 'ENSEIGNANT')
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission d'effectuer cette action."
      });
    }
    next();
  };
};

// ── Helpers nommés pour la lisibilité dans les routes ──
export const isAdmin    = restrictTo('ADMIN_PRINCIPAL');
export const isParent   = restrictTo('PARENT');
export const isTeacher  = restrictTo('ENSEIGNANT');
export const isEleve    = restrictTo('ELEVE');
export const authenticateToken = protect;