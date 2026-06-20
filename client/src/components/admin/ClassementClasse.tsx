// components/admin/ClassementClasse.tsx
const ClassementClasse = ({ bulletins }) => {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>Classement de la Classe</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
              <th className="px-3 py-3">Rang</th>
              <th className="px-3 py-3">Élève</th>
              <th className="px-3 py-3">Moyenne</th>
              <th className="px-3 py-3">Points Totaux</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bulletins.map((b) => (
              <tr key={b.matricule} className="hover:bg-gray-50">
                <td className="px-3 py-3 font-bold">
                  {b.rang === 1 ? '🥇 1er' : b.rang === 2 ? '🥈 2ème' : `${b.rang}ème`}
                </td>
                <td className="px-3 py-3 uppercase text-sm">{b.nom} {b.prenom}</td>
                <td className="px-3 py-3 font-bold text-sm" style={{ color: 'var(--navy)' }}>{b.moyenne} / 20</td>
                <td className="px-3 py-3 text-sm text-gray-500">{b.totalPoints} / {b.totalCoeffs * 20}</td>
                <td className="px-3 py-3">
                  <button className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Voir Bulletin</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};