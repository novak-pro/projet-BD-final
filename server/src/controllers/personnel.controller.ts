import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllPersonnel = async (req: Request, res: Response) => {
  try {
    const personnel = await prisma.personnel.findMany({
      include: {
        user: { select: { email: true, status: true } },
        cours: { include: { matiere: true, classe: true, salle: true } },
        salleTitulaire: true,
      }
    });
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du personnel" });
  }
};

export const updatePersonnel = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { nom, prenom, telephone, fonction, ville, quartier, departement, photo, statut, email } = req.body;

    const person = await prisma.personnel.findUnique({ where: { id } });
    if (!person) return res.status(404).json({ error: "Personnel non trouvé" });

    const result = await prisma.$transaction(async (tx) => {
      if (email) {
        await tx.user.update({
          where: { id: person.userId },
          data: { email }
        });
      }
      return tx.personnel.update({
        where: { id },
        data: { nom, prenom, telephone, fonction, ville, quartier, departement, photo, statut },
        include: {
          user: { select: { email: true, status: true } },
          cours: { include: { matiere: true, classe: true, salle: true } },
          salleTitulaire: true,
        }
      });
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

export const deactivatePersonnel = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const person = await prisma.personnel.findUnique({
      where: { id },
      include: { user: { select: { id: true } } },
    });
    if (!person) return res.status(404).json({ error: "Personnel non trouvé" });

    await prisma.user.update({
      where: { id: person.user.id },
      data: { status: 'DISABLED' },
    });

    res.json({ message: "Compte désactivé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la désactivation" });
  }
};

// Promouvoir un enseignant comme titulaire d'une salle
export const promouvoirTitulaire = async (req: Request, res: Response) => {
  try {
    const { personnelId, salleId } = req.body;

    // Vérifier que la salle existe
    const salle = await prisma.salle.findUnique({ where: { idSalle: Number(salleId) } });
    if (!salle) return res.status(404).json({ error: "Salle non trouvée" });

    // Vérifier que la salle n'a pas déjà un titulaire
    if (salle.enseignantTitulaireId && salle.enseignantTitulaireId !== Number(personnelId)) {
      return res.status(400).json({ error: "Cette salle a déjà un titulaire" });
    }

    // Si l'enseignant était déjà titulaire d'une autre salle, retirer l'ancienne
    const oldSalle = await prisma.salle.findFirst({
      where: { enseignantTitulaireId: Number(personnelId), idSalle: { not: Number(salleId) } }
    });
    if (oldSalle) {
      await prisma.salle.update({
        where: { idSalle: oldSalle.idSalle },
        data: { enseignantTitulaireId: null }
      });
    }

    const updated = await prisma.salle.update({
      where: { idSalle: Number(salleId) },
      data: { enseignantTitulaireId: Number(personnelId) },
      include: { titulaire: { select: { id: true, nom: true, prenom: true } } },
    });

    // Notifier l'enseignant
    const enseignant = await prisma.personnel.findUnique({
      where: { id: Number(personnelId) },
      include: { user: { select: { id: true } } },
    });
    if (enseignant?.user) {
      await prisma.message.create({
        data: {
          content: `Vous avez été promu titulaire de la salle "${salle.libelle ?? salleId}". En tant que titulaire, vous êtes responsable de cette salle et devez assurer le suivi des élèves qui y sont affectés.`,
          type: 'PERSONAL',
          status: 'SENT',
          senderId: (req as any).user.id,
          recipientId: enseignant.user.id,
        },
      });
    }

    res.json({ message: "Enseignant promu titulaire", salle: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la promotion" });
  }
};

// Retirer la promotion titulaire d'un enseignant
export const retirerPromotion = async (req: Request, res: Response) => {
  try {
    const { personnelId } = req.params;
    const salle = await prisma.salle.findFirst({
      where: { enseignantTitulaireId: Number(personnelId) }
    });
    if (!salle) return res.status(404).json({ error: "Cet enseignant n'est titulaire d'aucune salle" });

    await prisma.salle.update({
      where: { idSalle: salle.idSalle },
      data: { enseignantTitulaireId: null },
    });

    // Notifier l'enseignant
    const enseignant = await prisma.personnel.findUnique({
      where: { id: Number(personnelId) },
      include: { user: { select: { id: true } } },
    });
    if (enseignant?.user) {
      await prisma.message.create({
        data: {
          content: `Votre promotion en tant que titulaire de la salle "${salle.libelle}" a été retirée.`,
          type: 'PERSONAL',
          status: 'SENT',
          senderId: (req as any).user.id,
          recipientId: enseignant.user.id,
        },
      });
    }

    res.json({ message: "Promotion retirée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur" });
  }
};

// Affecter un enseignant à une salle avec des matières
export const affecterEnseignantSalle = async (req: Request, res: Response) => {
  try {
    const { personnelId, salleId, classeId, matiereIds } = req.body;

    if (!personnelId || !matiereIds || !Array.isArray(matiereIds) || matiereIds.length === 0) {
      return res.status(400).json({ error: "Champs requis: personnelId, matiereIds (tableau)" });
    }

    const enseignant = await prisma.personnel.findUnique({ where: { id: Number(personnelId) } });
    if (!enseignant) return res.status(404).json({ error: "Enseignant non trouvé" });

    let idClasse = classeId ? Number(classeId) : null;
    let idSalle = salleId ? Number(salleId) : null;

    // Si une salle est fournie, récupérer sa classe
    if (idSalle) {
      const salle = await prisma.salle.findUnique({ where: { idSalle: Number(salleId) } });
      if (!salle) return res.status(404).json({ error: "Salle non trouvée" });
      idClasse = salle.idClasse ?? idClasse;
    }

    if (!idClasse) {
      return res.status(400).json({ error: "Une classe est requise (via salleId ou classeId)" });
    }

    // Créer une entrée Cours pour chaque matière
    const coursList = await Promise.all(
      matiereIds.map((matiereId: number) =>
        prisma.cours.create({
          data: {
            enseignantId: Number(personnelId),
            idSalle: idSalle,
            idClasse: idClasse,
            idMatiere: Number(matiereId),
            coefficient: 1.0,
          },
          include: { matiere: true, salle: true, classe: true },
        })
      )
    );

    // Notifier l'enseignant
    const matieresList = coursList.map(c => c.matiere.nom).join(', ');
    const classeLibelle = coursList[0]?.classe?.libelle ?? `classe #${idClasse}`;
    await prisma.message.create({
      data: {
        content: `Vous avez été affecté à la classe ${classeLibelle} pour enseigner : ${matieresList}.`,
        type: 'PERSONAL',
        status: 'SENT',
        senderId: (req as any).user.id,
        recipientId: enseignant.userId,
      },
    });

    res.status(201).json({ message: "Affectation réussie", cours: coursList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'affectation" });
  }
};

// Récupérer les matières enseignées par un enseignant dans une salle
export const getCoursEnseignant = async (req: Request, res: Response) => {
  try {
    const { personnelId } = req.params;
    const cours = await prisma.cours.findMany({
      where: { enseignantId: Number(personnelId), idSalle: { not: null } },
      include: { matiere: true, salle: true },
    });
    res.json(cours);
  } catch (error) {
    res.status(500).json({ error: "Erreur" });
  }
};
