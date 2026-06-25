import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.eleve.findMany({
      include: {
        parent: true,
        classroom: true,
        salle: true,
        evaluations: true
      },
      orderBy: { nom: 'asc' }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { matricule } = req.params;
    const student = await prisma.eleve.findUnique({
      where: { matricule: parseInt(matricule as string) },
      include: {
        parent: true,
        classroom: {
          include: {
            cycle: true,
            responsable: true
          }
        },
        evaluations: {
          include: {
            cours: true
          }
        }
      }
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, dateNaissance, lieuNaissance, sexe, langue, parentId,niveau, classroomId } = req.body;
    
    const student = await prisma.eleve.create({
      data: {
        nom,
        prenom,
        dateNaissance: new Date(dateNaissance),
        lieuNaissance,
        sexe: sexe || 0,
        langue: langue || 'Français',
        parentId,
        classroomId: classroomId || null,
        niveau: niveau || null,
        statut: 'Inscrit'
      },
      include: {
        parent: true,
        classroom: true
      }
    });
    
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create student' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { matricule } = req.params;
    const { nom, prenom, dateNaissance, lieuNaissance, sexe, langue, niveau, classroomId, salleId, statut } = req.body;
    
    const student = await prisma.eleve.update({
      where: { matricule: parseInt(matricule as string) },
      data: {
        nom,
        prenom,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
        lieuNaissance,
        sexe,
        langue,
        niveau,
        classroomId: classroomId ? Number(classroomId) : null,
        salleId: salleId ? Number(salleId) : null,
        statut
      },
      include: {
        parent: { include: { user: true } },
        classroom: true,
        salle: true,
      }
    });

    // Notify parent of the update
    if (student.parent?.user) {
      const content = `Les informations de votre enfant ${student.prenom} ${student.nom} (Matricule: ${student.matricule}) ont été modifiées par l'administration. Veuillez vérifier son profil.`;
      await prisma.message.create({
        data: {
          content,
          type: 'PERSONAL',
          status: 'SENT',
          senderId: (req as any).user.id,
          recipientId: student.parent.user.id,
        },
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student' });
  }
};

export const getStudentsWithFrequente = async (req: Request, res: Response) => {
  try {
    const anneeId = req.query.anneeId as string | undefined;

    const whereFilter: any = {};

    if (anneeId) {
      whereFilter.frequences = { some: { idAcademi: parseInt(anneeId) } };
    }

    const students = await prisma.eleve.findMany({
      where: whereFilter,
      include: {
        parent: true,
        classroom: true,
        salle: true,
        frequences: {
          include: {
            classe: { include: { cycle: true } },
            annee: true,
          },
          orderBy: { idFrequente: 'desc' },
        },
      },
      orderBy: { nom: 'asc' },
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students with frequente' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { matricule } = req.params;
    
    await prisma.eleve.delete({
      where: { matricule: parseInt(matricule as string) }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

export const getStudentsByClass = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.params;
    
    const students = await prisma.eleve.findMany({
      where: { classroomId: parseInt(classroomId as string) },
      include: {
        parent: true,
        evaluations: {
          include: {
            cours: true
          }
        }
      }
    });
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students by class' });
  }
};
