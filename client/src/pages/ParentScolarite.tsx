import React, { useState, useEffect } from 'react';
import { enrollmentService } from '../services/enrollmentService';

const ParentScolarite = () => {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: '0'
  });
  const [requests, setRequests] = useState([]);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    const res = await enrollmentService.getAll();
    setRequests(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enrollmentService.submit(formData);
      alert("Demande envoyée !");
      loadRequests();
    } catch (err) { alert("Erreur lors de l'envoi"); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Scolarité : Inscription de mon enfant</h1>
      
      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md grid grid-cols-2 gap-4">
        <input type="text" placeholder="Nom de l'enfant" className="border p-2 rounded" 
          onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
        <input type="text" placeholder="Prénom de l'enfant" className="border p-2 rounded" 
          onChange={(e) => setFormData({...formData, prenom: e.target.value})} required />
        <input type="date" className="border p-2 rounded" 
          onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})} required />
        <input type="text" placeholder="Lieu de naissance" className="border p-2 rounded" 
          onChange={(e) => setFormData({...formData, lieuNaissance: e.target.value})} required />
        <select className="border p-2 rounded" onChange={(e) => setFormData({...formData, sexe: e.target.value})}>
          <option value="0">Fille</option>
          <option value="1">Garçon</option>
        </select>
        <button className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Soumettre la demande d'inscription
        </button>
      </form>

      {/* Liste des demandes */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Mes demandes en cours</h2>
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div key={req.id} className="border p-4 rounded flex justify-between items-center bg-gray-50">
              <div>
                <p className="font-bold">{req.prenom} {req.nom}</p>
                <p className="text-sm text-gray-500">Soumis le {new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                req.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' : 
                req.status === 'APPROVED' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentScolarite;