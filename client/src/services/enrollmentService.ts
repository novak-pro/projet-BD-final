import axios from 'axios';

const API_URL = 'http://localhost:5000/api/enrollments';

export const enrollmentService = {
  // Envoyer une demande (Parent)
  submit: async (data: any) => {
    const token = localStorage.getItem('token');
    return axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Récupérer les demandes (Admin ou Parent selon le token)
  getAll: async () => {
    const token = localStorage.getItem('token');
    return axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Valider/Refuser (Admin)
  process: async (id: number, status: 'APPROVED' | 'REJECTED', notes: string) => {
    const token = localStorage.getItem('token');
    return axios.patch(`${API_URL}/${id}/process`, { status, adminNotes: notes }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};