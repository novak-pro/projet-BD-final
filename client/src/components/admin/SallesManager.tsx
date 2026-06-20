import React, { useState, useEffect } from 'react';
import { Home, Wrench, Construction, Ban, CheckCircle } from 'lucide-react';
import axios from 'axios';

const statusStyles: Record<string, string> = {
  DISPONIBLE: "bg-green-100 text-green-700 border-green-200",
  EN_SERVICE: "bg-blue-100 text-blue-700 border-blue-200",
  EN_RENOVATION: "bg-orange-100 text-orange-700 border-orange-200",
  EN_CONSTRUCTION: "bg-yellow-100 text-yellow-700 border-yellow-200",
  FERMEE_TEMPORAIREMENT: "bg-red-100 text-red-700 border-red-200",
};

const SallesManager = () => {
  const [salles, setSalles] = useState<any[]>([]);

  useEffect(() => {
    fetchSalles();
  }, []);

  const fetchSalles = async () => {
    const res = await axios.get('/api/admin/salles');
    setSalles(res.data);
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <Home size={18} style={{ color: 'var(--navy)' }} />
          Gestion des Salles
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {salles.map((salle) => (
          <div key={salle.id} className="bg-white rounded-[var(--radius-lg)] border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-[var(--radius)]" style={{ background: 'var(--accent-light)' }}>
                <Home size={24} style={{ color: 'var(--navy)' }} />
              </div>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusStyles[salle.etat]}`}>
                {salle.etat.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-lg" style={{ color: 'var(--navy)' }}>{salle.libelle}</h3>
              <p className="text-gray-500 text-sm">{salle.position}</p>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Capacité: <strong>{salle.capacite}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};