import React, { useEffect, useState } from 'react';
import { enrollmentService } from '../services/enrollmentService';

interface EnrollmentRequest {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  parent: {
    nom: string;
    prenom: string;
    telephone: string;
  };
  createdAt: string;
}

const AdminEnrollments = () => {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await enrollmentService.getAll();
      setRequests(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const notes = window.prompt(status === 'APPROVED' ? "Note optionnelle :" : "Motif du refus obligatore :");
    
    if (status === 'REJECTED' && !notes) {
      alert("Un motif est requis pour rejeter une inscription.");
      return;
    }

    try {
      await enrollmentService.process(id, status, notes || "");
      alert(`Demande ${status === 'APPROVED' ? 'validée (Élève créé)' : 'refusée'}.`);
      fetchRequests(); // Recharger la liste
    } catch (err) {
      alert("Erreur lors du traitement");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement des dossiers...</div>;

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Gestion des Inscriptions</h2>
          <span className="admin-badge" style={{ background: 'var(--navy)', color: '#fff' }}>
            {requests.filter(r => r.status === 'PENDING').length} demande(s) en attente
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                <th className="px-3 py-3">Enfant</th>
                <th className="px-3 py-3">Parent</th>
                <th className="px-3 py-3">Date Demande</th>
                <th className="px-3 py-3">Statut</th>
                <th className="px-3 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    <div className="font-bold text-gray-800 text-sm">{req.prenom} {req.nom}</div>
                    <div className="text-xs text-gray-500">
                      Né(e) le {new Date(req.dateNaissance).toLocaleDateString()} ({req.sexe === 0 ? 'F' : 'M'})
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600">
                    {req.parent.prenom} {req.parent.nom}<br />
                    <span className="text-gray-400">{req.parent.telephone}</span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`admin-badge ${
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                      req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {req.status === 'PENDING' ? 'À traiter' : req.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {req.status === 'PENDING' && (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleAction(req.id, 'APPROVED')}
                          className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700">
                          Valider
                        </button>
                        <button onClick={() => handleAction(req.id, 'REJECTED')}
                          className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700">
                          Refuser
                        </button>
                      </div>
                    )}
                    {req.status !== 'PENDING' && (
                      <span className="text-gray-400 text-sm italic">Traité</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requests.length === 0 && (
            <div className="p-10 text-center text-gray-400">Aucune demande d'inscription pour le moment.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollments;