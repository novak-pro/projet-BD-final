import React, { useEffect, useState } from 'react';
import { enrollmentService } from '../services/enrollmentService';
import api from '../services/axiosInstance';
import { notifySuccess, notifyError } from '../utils/notifications';
import ConfirmModal from '../components/ConfirmModal';

interface ClasseItem {
  idClasse: number;
  libelle: string;
  cycle?: { libelle: string };
}

interface EnrollmentRequest {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: number;
  niveau: string;
  classe: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  recuPDF: string | null;
  modePaiement: string | null;
  parent: {
    nom: string;
    prenom: string;
    telephone: string;
  };
  createdAt: string;
}

const AdminEnrollments = () => {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [classes, setClasses] = useState<ClasseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState<{ id: number } | null>(null);
  const [selectedClasse, setSelectedClasse] = useState('');

  useEffect(() => {
    Promise.all([fetchRequests(), fetchClasses()]);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await enrollmentService.getAll();
      setRequests(res.data);
    } catch (err) {
      console.error("Erreur", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/enrollments/classes');
      setClasses(res.data);
    } catch (err) {
      console.error("Erreur classes", err);
    }
  };

  const handleAction = async (id: number, status: 'APPROVED' | 'REJECTED', classroomId?: string) => {
    if (status === 'REJECTED') {
      const notes = window.prompt("Motif du refus obligatoire :");
      if (!notes) { notifyError("Un motif est requis."); return; }
      try {
        await enrollmentService.process(id, status, notes);
        notifySuccess("Demande refusée.");
        fetchRequests();
      } catch (err) { notifyError("Erreur"); }
      return;
    }

    setApproveModal({ id });
  };

  const confirmApprove = async () => {
    if (!approveModal) return;
    try {
      await enrollmentService.process(approveModal.id, 'APPROVED', '', selectedClasse);
      notifySuccess("Demande validée — Élève créé avec sa classe.");
      setApproveModal(null);
      setSelectedClasse('');
      fetchRequests();
    } catch (err) {
      notifyError("Erreur lors du traitement");
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
                <th className="px-3 py-3">Cycle / Classe</th>
                <th className="px-3 py-3">Paiement</th>
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
                  <td className="px-3 py-3 text-sm">
                    <span className="font-medium">{req.niveau}</span>
                    {req.classe && <span className="text-gray-400"> — {req.classe}</span>}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <div className="flex flex-col gap-1">
                      {req.modePaiement ? (
                        <span className="text-xs font-medium text-gray-600">
                          {req.modePaiement === 'CASH' ? 'Cash école' : 'Virement'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                      {req.recuPDF ? (
                        <button onClick={() => window.open(req.recuPDF!, '_blank')}
                          className="text-xs text-blue-600 underline text-left">Voir la facture</button>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Aucune facture</span>
                      )}
                    </div>
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

      {/* Modal d'approbation avec sélection de classe */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Valider l'inscription</h2>
            <p className="text-sm text-gray-500 mb-6">Assigner une classe à l'élève :</p>
            
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none mb-6"
            >
              <option value="">Sans classe (pas de classroom)</option>
              {classes.map((cl) => (
                <option key={cl.idClasse} value={cl.idClasse}>{cl.libelle} {cl.cycle ? `(${cl.cycle.libelle})` : ''}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => { setApproveModal(null); setSelectedClasse(''); }}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmApprove}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-[var(--radius)] font-semibold hover:bg-green-700 transition"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollments;
