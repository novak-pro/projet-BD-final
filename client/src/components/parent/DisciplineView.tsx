// components/parent/DisciplineView.tsx
const DisciplineView = ({ incidents, soldePoints }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl border flex justify-between items-center">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">Solde de conduite</h3>
          <p className="text-3xl font-bold text-indigo-600">{soldePoints} / 20</p>
        </div>
        <div className={`h-4 w-4 rounded-full ${soldePoints < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b font-bold">Historique des incidents</div>
        {incidents.map((inc) => (
          <div key={inc.id} className="p-4 border-b last:border-0 hover:bg-gray-50">
            <div className="flex justify-between">
              <span className="font-semibold text-red-600">-{inc.pointsDeduits} points</span>
              <span className="text-sm text-gray-400">{new Date(inc.date).toLocaleDateString()}</span>
            </div>
            <p className="text-sm font-medium mt-1">{inc.type}</p>
            <p className="text-xs text-gray-500 italic mt-1">"{inc.commentaire}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};