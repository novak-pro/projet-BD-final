import api from './axiosInstance';

export const paymentService = {
  create: (data: any) => api.post('/payments', data),
  getHistory: (parentId: number) => api.get(`/payments/history/${parentId}`)
};

export const disciplineService = {
  reportIncident: (data: any) => api.post('/discipline/incident', data),
  getEleveIncidents: (id: number) => api.get(`/discipline/eleve/${id}`)
};

export const noteService = {
  saveBulk: (data: any) => api.post('/notes/bulk', data)
};

export const salleService = {
  getAll: () => api.get('/salles'),
  updateStatus: (id: number, etat: string) => api.patch(`/salles/${id}/etat`, { etat })
};

export const personnelService = {
  getAll: () => api.get('/personnel'),
  update: (id: number, data: any) => api.put(`/personnel/${id}`, data),
  deactivate: (id: number) => api.post(`/personnel/${id}/deactivate`),
  promouvoirTitulaire: (data: any) => api.post('/personnel/promouvoir-titulaire', data),
  retirerPromotion: (personnelId: number) => api.delete(`/personnel/retirer-promotion/${personnelId}`),
  affecterSalle: (data: any) => api.post('/personnel/affecter-salle', data),
  getCours: (personnelId: number) => api.get(`/personnel/${personnelId}/cours`),
};

export const matiereService = {
  getAll: () => api.get('/matieres'),
  create: (nom: string, options?: { code?: string; idClasse?: number }) => api.post('/matieres', { nom, ...options }),
  update: (id: number, data: any) => api.put(`/matieres/${id}`, data),
  delete: (id: number) => api.delete(`/matieres/${id}`)
};

export const epreuveService = {
  getAll: () => api.get('/epreuves')
};
