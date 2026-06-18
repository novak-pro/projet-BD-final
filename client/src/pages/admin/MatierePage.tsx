import React, { useEffect, useState } from 'react';
import {  matiereService } from '../../services/apiServices';

interface Matiere {
  id: number;
  nom: string;
}
const MatierePage = () => {
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des Matières</h1>
      <div className="flex gap-2 mb-6">
        <input value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded" placeholder="Nom matière" />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {matieres.map(m => (
          <div key={m.id} className="p-4 bg-white shadow rounded">{m.nom}</div>
        ))}
      </div>
    </div>
  );
};
export default MatierePage;