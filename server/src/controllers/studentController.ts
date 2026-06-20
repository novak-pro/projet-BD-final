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
    const { nom, prenom, dateNaissance, lieuNaissance, sexe, langue, classroomId, salleId, statut } = req.body;
    
    const student = await prisma.eleve.update({
      where: { matricule: parseInt(matricule as string) },
      data: {
        nom,
        prenom,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
        lieuNaissance,
        sexe,
        langue,
        classroomId: classroomId ? Number(classroomId) : undefined,
        salleId: salleId ? Number(salleId) : null,
        statut
      },
      include: {
        parent: true,
        classroom: true
      }
    });
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student' });
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
