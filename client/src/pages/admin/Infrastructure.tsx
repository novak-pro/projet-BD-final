// pages/admin/Infrastructure.tsx
import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Plus, Search, RefreshCw, Trash2, Building2 } from 'lucide-react';
import api from '../../services/axiosInstance';
import { useTranslation } from '../../i18n/LanguageContext';

// Styles pour les états des salles selon le cahier des charges (Section 6)
const statusConfig = {
  DISPONIBLE: { color: "bg-green-100 text-green-700 border-green-200", label: "Disponible" },
  EN_SERVICE: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "En service" },
  EN_RENOVATION: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "En rénovation" },
  EN_CONSTRUCTION: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "En construction" },
  FERMEE_TEMPORAIREMENT: { color: "bg-red-100 text-red-700 border-red-200", label: "Fermée" },
};

const AdminInfrastructure = () => {
  const { t } = useTranslation();
  const [salles, setSalles] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [newMatiere, setNewMatiere] = useState("");
  const [showSalleModal, setShowSalleModal] = useState(false);
  const [newSalle, setNewSalle] = useState({ libelle: '', position: '', capacite: '', idClasse: '1' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sallesRes, matieresRes] = await Promise.all([
        api.get('/admin/salles'),
        api.get('/admin/matieres')
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
      await api.post('/admin/matieres', { nom: newMatiere });
      setNewMatiere("");
      fetchData();
    } catch (err) {
      alert("Cette matière existe peut-être déjà.");
    }
  };

  const handleDeleteMatiere = async (id: number) => {
    try {
      await api.delete(`/matieres/${id}`);
      fetchData();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleAddSalle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/salles', {
        ...newSalle,
        capacite: parseInt(newSalle.capacite) || 0,
        etat: 'DISPONIBLE'
      });
      setShowSalleModal(false);
      setNewSalle({ libelle: '', position: '', capacite: '', idClasse: '1' });
      fetchData();
    } catch (err) {
      alert("Erreur lors de la création de la salle");
    }
  };

  const handleUpdateEtat = async (id: number, etat: string) => {
    try {
      await api.patch(`/admin/salles/${id}/etat`, { etat });
      fetchData();
    } catch (err) {
      alert("Erreur de mise à jour");
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <Building2 size={18} style={{ color: 'var(--navy)' }} />
          Gestion Infrastructure
        </h2>
        <button onClick={() => setShowSalleModal(true)} className="btn-admin text-sm py-1.5 px-3">
          <Plus size={16} /> Nouvelle Salle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SECTION SALLES (Grille - 2/3 de l'espace) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Home size={20} className="text-indigo-600" /> Salles de classe
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salles.map((salle: any) => (
              <div key={salle.idSalle} className="bg-white border rounded-[var(--radius-lg)] p-5 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[salle.etat as keyof typeof statusConfig]?.color}`}>
                    {statusConfig[salle.etat as keyof typeof statusConfig]?.label}
                  </span>
                  <button onClick={() => {
                    const etats = ['DISPONIBLE', 'EN_SERVICE', 'EN_RENOVATION', 'FERMEE_TEMPORAIREMENT'];
                    const currentIdx = etats.indexOf(salle.etat);
                    const nextEtat = etats[(currentIdx + 1) % etats.length];
                    handleUpdateEtat(salle.idSalle, nextEtat);
                  }} className="text-gray-400 hover:text-indigo-600"><RefreshCw size={16} /></button>
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

          <div className="bg-white border rounded-[var(--radius-lg)] p-6 shadow-sm">
            <form onSubmit={handleAddMatiere} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter une matière</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMatiere}
                  onChange={(e) => setNewMatiere(e.target.value)}
                  placeholder="ex: Mathématiques"
                  className="flex-1 border border-gray-200 rounded-[var(--radius)] px-3 py-2 outline-none text-sm focus:border-[var(--accent)]"
                />
                <button type="submit" className="btn-admin p-2">
                  <Plus size={20} />
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {matieres.map((m: any) => (
                <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-[var(--radius)] group">
                  <span className="font-medium text-gray-700">{m.nom}</span>
                  <button onClick={() => handleDeleteMatiere(m.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Modal Nouvelle Salle ── */}
      {showSalleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Nouvelle Salle</h2>
            <form onSubmit={handleAddSalle} className="space-y-4">
              <input
                type="text"
                placeholder="Libellé (ex: Salle 101)"
                required
                className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none"
                value={newSalle.libelle}
                onChange={(e) => setNewSalle({ ...newSalle, libelle: e.target.value })}
              />
              <input
                type="text"
                placeholder="Position (ex: Bâtiment A, 1er étage)"
                className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none"
                value={newSalle.position}
                onChange={(e) => setNewSalle({ ...newSalle, position: e.target.value })}
              />
              <input
                type="number"
                placeholder="Capacité"
                required
                className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none"
                value={newSalle.capacite}
                onChange={(e) => setNewSalle({ ...newSalle, capacite: e.target.value })}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSalleModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-[var(--radius)] font-semibold hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-admin justify-center"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInfrastructure;