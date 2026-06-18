// pages/admin/Infrastructure.tsx
import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Plus, Search, RefreshCw, Trash2 } from 'lucide-react';
import api from '../../services/axiosInstance';

// Styles pour les états des salles selon le cahier des charges (Section 6)
const statusConfig = {
  DISPONIBLE: { color: "bg-green-100 text-green-700 border-green-200", label: "Disponible" },
  EN_SERVICE: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "En service" },
  EN_RENOVATION: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "En rénovation" },
  EN_CONSTRUCTION: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "En construction" },
  FERMEE_TEMPORAIREMENT: { color: "bg-red-100 text-red-700 border-red-200", label: "Fermée" },
};

const AdminInfrastructure = () => {
  const [salles, setSalles] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [newMatiere, setNewMatiere] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sallesRes, matieresRes] = await Promise.all([
        api.get('/api/admin/salles'),
        api.get('/api/admin/matieres')
      ]);
      setSalles(sallesRes.data);
      setMatieres(matieresRes.data);
    } catch (err) {
      console.error("Erreur de chargement", err);
    }
  };

  const handleAddMatiere = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatiere) return;
    try {
      await api.post('/api/admin/matieres', { nom: newMatiere });
      setNewMatiere("");
      fetchData(); // Rafraîchir la liste
    } catch (err) {
      alert("Cette matière existe peut-être déjà.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* HEADER */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Gestion Infrastructure</h1>
        <p className="text-gray-500">Configurez les salles de classe et les matières de l'établissement.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SECTION SALLES (Grille - 2/3 de l'espace) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Home size={20} className="text-indigo-600" /> Salles de classe
            </h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
              <Plus size={18} /> Nouvelle Salle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salles.map((salle: any) => (
              <div key={salle.idSalle} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[salle.etat as keyof typeof statusConfig]?.color}`}>
                    {statusConfig[salle.etat as keyof typeof statusConfig]?.label}
                  </span>
                  <button className="text-gray-400 hover:text-indigo-600"><RefreshCw size={16} /></button>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{salle.libelle}</h3>
                <p className="text-sm text-gray-500 mb-4">{salle.position}</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-600">
                  <div className="bg-gray-50 p-2 rounded">Capacité: {salle.capacite}</div>
                  <div className="bg-gray-50 p-2 rounded">Classe: {salle.classeAssociee || 'Libre'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION MATIÈRES (Formulaire - 1/3 de l'espace) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" /> Matières
          </h2>

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <form onSubmit={handleAddMatiere} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter une matière</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMatiere}
                  onChange={(e) => setNewMatiere(e.target.value)}
                  placeholder="ex: Mathématiques"
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
                  <Plus size={20} />
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {matieres.map((m: any) => (
                <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group">
                  <span className="font-medium text-gray-700">{m.nom}</span>
                  <button className="text-red-400 opacity-0 group-hover:opacity-100 transition hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminInfrastructure;