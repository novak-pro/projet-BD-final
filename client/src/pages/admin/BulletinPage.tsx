import React, { useState } from 'react';
import { FileBarChart, Download, Printer, User as UserIcon } from 'lucide-react';

const BulletinPage = () => {
  const [classe, setClasse] = useState("");

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileBarChart className="text-green-600"/> Bulletins & Performance</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"><Printer size={18}/> Imprimer Tout</button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"><Download size={18}/> Export PDF</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-600">Élève</th>
              <th className="p-4 font-bold text-gray-600">Moyenne Générale</th>
              <th className="p-4 font-bold text-gray-600">Rang</th>
              <th className="p-4 font-bold text-gray-600">Assiduité</th>
              <th className="p-4 font-bold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-gray-50 transition">
              <td className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><UserIcon size={16}/></div>
                <div>
                  <p className="font-bold text-gray-800 uppercase">GUESSONG Yann</p>
                  <p className="text-xs text-gray-500">Matricule: #202401</p>
                </div>
              </td>
              <td className="p-4"><span className="font-bold text-green-600 text-lg">16.45 / 20</span></td>
              <td className="p-4 font-medium text-gray-700">🥈 2ème sur 30</td>
              <td className="p-4 text-sm text-gray-500">3 absences</td>
              <td className="p-4">
                <button className="text-indigo-600 font-bold hover:underline">Voir détails</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BulletinPage;