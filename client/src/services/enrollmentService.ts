import api from './axiosInstance';

const BASE = '/enrollments';

export const enrollmentService = {
  submit: async (data: any) => api.post(BASE, data),

  getAll: async () => api.get(BASE),

  process: async (id: number, status: 'APPROVED' | 'REJECTED', notes: string, classroomId?: string) =>
    api.patch(`${BASE}/${id}/process`, { status, adminNotes: notes, classroomId }),
};