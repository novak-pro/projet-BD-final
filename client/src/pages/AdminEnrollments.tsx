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

  if (loading) return <div className="p-10 text-center text-blue-600">Chargement des dossiers...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Inscriptions</h1>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
          {requests.filter(r => r.status === 'PENDING').length} demande(s) en attente
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 border-b">Enfant</th>
              <th className="p-4 border-b">Parent</th>
              <th className="p-4 border-b">Date Demande</th>
              <th className="p-4 border-b">Statut</th>
              <th className="p-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 border-b">
                  <div className="font-bold text-gray-900">{req.prenom} {req.nom}</div>
                  <div className="text-xs text-gray-500">
                    Né(e) le {new Date(req.dateNaissance).toLocaleDateString()} ({req.sexe === 0 ? 'F' : 'M'})
                  </div>
                </td>
                <td className="p-4 border-b text-sm text-gray-700">
                  {req.parent.prenom} {req.parent.nom} <br />
                  <span className="text-gray-500">{req.parent.telephone}</span>
                </td>
                <td className="p-4 border-b text-sm text-gray-600">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 border-b">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                    req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {req.status === 'PENDING' ? 'À traiter' : req.status}
                  </span>
                </td>
                <td className="p-4 border-b text-center">
                  {req.status === 'PENDING' && (
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleAction(req.id, 'APPROVED')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Valider
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'REJECTED')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                      >
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
          <div className="p-10 text-center text-gray-500">Aucune demande d'inscription pour le moment.</div>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollments;