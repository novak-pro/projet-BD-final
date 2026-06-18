import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const paymentService = {
  create: (data: any) => axios.post(`${API_URL}/payments`, data, getAuthHeader()),
  getHistory: (parentId: number) => axios.get(`${API_URL}/payments/history/${parentId}`, getAuthHeader())
};

export const disciplineService = {
  reportIncident: (data: any) => axios.post(`${API_URL}/discipline/incident`, data, getAuthHeader()),
  getEleveIncidents: (id: number) => axios.get(`${API_URL}/discipline/eleve/${id}`, getAuthHeader())
};

export const noteService = {
  saveBulk: (data: any) => axios.post(`${API_URL}/notes/bulk`, data, getAuthHeader())
};

export const salleService = {
  getAll: () => axios.get(`${API_URL}/salles`, getAuthHeader()),
  updateStatus: (id: number, etat: string) => axios.patch(`${API_URL}/salles/${id}/etat`, { etat }, getAuthHeader())
};

export const personnelService = {
  getAll: () => axios.get(`${API_URL}/personnel`, getAuthHeader()),
  affecter: (data: any) => axios.post(`${API_URL}/personnel/affecter`, data, getAuthHeader())
};

export const matiereService = {
  getAll: () => axios.get(`${API_URL}/matieres`, getAuthHeader()),
  create: (nom: string) => axios.post(`${API_URL}/matieres`, { nom }, getAuthHeader())
};