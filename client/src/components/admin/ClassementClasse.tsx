// components/admin/ClassementClasse.tsx
const ClassementClasse = ({ bulletins }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Classement de la Classe</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-3 rounded-tl-lg">Rang</th>
              <th className="p-3">Élève</th>
              <th className="p-3">Moyenne</th>
              <th className="p-3">Points Totaux</th>
              <th className="p-3 rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {bulletins.map((b) => (
              <tr key={b.matricule} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold">
                  {b.rang === 1 ? '🥇 1er' : b.rang === 2 ? '🥈 2ème' : `${b.rang}ème`}
                </td>
                <td className="p-3 uppercase">{b.nom} {b.prenom}</td>
                <td className="p-3 text-indigo-700 font-bold">{b.moyenne} / 20</td>
                <td className="p-3 text-gray-500">{b.totalPoints} / {b.totalCoeffs * 20}</td>
                <td className="p-3">
                  <button className="text-blue-600 hover:underline">Voir Bulletin</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};