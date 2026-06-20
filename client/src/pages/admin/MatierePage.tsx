import React, { useEffect, useState } from 'react';
import { matiereService } from '../../services/apiServices';
import { BookOpen, Plus } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface Matiere {
  id: number;
  nom: string;
}
const MatierePage = () => {
  const { t } = useTranslation();
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [name, setName] = useState('');

  const load = async () => {
    const res = await matiereService.getAll();
    setMatieres(res.data);
  };

  const handleAdd = async () => {
    await matiereService.create(name);
    setName('');
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <BookOpen size={18} style={{ color: 'var(--navy)' }} />
          Gestion des Matières
        </h2>
      </div>
      <div className="flex gap-2 mb-6">
        <input value={name} onChange={e => setName(e.target.value)} className="flex-1 border border-gray-200 p-2 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" placeholder="Nom matière" />
        <button onClick={handleAdd} className="btn-admin text-sm py-1.5 px-3">
          <Plus size={16} /> Ajouter
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {matieres.map(m => (
          <div key={m.id} className="p-3 bg-gray-50 rounded-[var(--radius)] border border-gray-100 text-sm font-medium text-gray-700">{m.nom}</div>
        ))}
      </div>
    </div>
  );
};
export default MatierePage;