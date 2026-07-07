import { useState, useEffect } from 'react';
import { FileBarChart, Download, Printer, User as UserIcon, RefreshCw, ScrollText, X } from 'lucide-react';
import api from '../../services/axiosInstance';
import { useTranslation } from '../../i18n/LanguageContext';

interface Bulletin {
  matricule: number;
  nom: string;
  prenom: string;
  moyenne: number;
  rang: number;
  totalPoints: number;
  totalCoeffs: number;
  details?: NoteDetail[];
}

interface NoteDetail {
  matiere: string;
  valeur: number;
  coefficient: number;
}

interface Classe {
  idClasse: number;
  libelle: string;
}

interface Trimestre {
  idTrimestre: number;
  libelle: string;
}

const BulletinPage = () => {
  const { t } = useTranslation();
  const [classe, setClasse] = useState("");
  const [trimestreId, setTrimestreId] = useState<number | ''>('');
  const [classes, setClasses] = useState<Classe[]>([]);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(false);

  // Détail modal
  const [detailStudent, setDetailStudent] = useState<Bulletin | null>(null);

  useEffect(() => { loadClasses(); loadTrimestres(); }, []);

  const loadTrimestres = async () => {
    try {
      const res = await api.get('/academique/annees/active');
      if (res.data?.trimestres) setTrimestres(res.data.trimestres);
    } catch { console.error("Erreur chargement trimestres"); }
  };

  const evaluation = trimestres.find(t => t.idTrimestre === trimestreId)?.libelle ?? '';

  useEffect(() => {
    if (classe && evaluation) loadBulletins();
  }, [classe, evaluation]);

  const loadClasses = async () => {
    try {
      const res = await api.get('/enrollments/classes');
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Erreur chargement classes"); }
  };

  const loadBulletins = async () => {
    if (!classe) return;
    setLoading(true);
    try {
      const res = await api.get(`/bulletins/classe?idClasse=${classe}&evaluation=${encodeURIComponent(evaluation)}`);
      setBulletins(Array.isArray(res.data) ? res.data : []);
    } catch {
      setBulletins([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (b: Bulletin) => {
    try {
      const res = await api.get(`/bulletins/details?matricule=${b.matricule}&evaluation=${encodeURIComponent(evaluation)}`);
      setDetailStudent({ ...b, details: res.data });
    } catch { setDetailStudent(b); }
  };

  const moyenneColor = (m: number) => {
    if (m >= 16) return 'text-green-600';
    if (m >= 12) return 'text-blue-600';
    if (m >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <ScrollText size={18} style={{ color: 'var(--navy)' }} />
          Bulletins & Performance
        </h2>
        <div className="flex items-center gap-3">
          <select className="border border-gray-200 rounded-[var(--radius)] py-1.5 px-3 text-sm outline-none focus:border-[var(--accent)]" value={trimestreId} onChange={e => setTrimestreId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Sélectionner un trimestre</option>
            {trimestres.map(t => (
              <option key={t.idTrimestre} value={t.idTrimestre}>{t.libelle}</option>
            ))}
          </select>
          <select className="border border-gray-200 rounded-[var(--radius)] py-1.5 px-3 text-sm outline-none focus:border-[var(--accent)]" value={classe} onChange={e => setClasse(e.target.value)}>
            <option value="">Sélectionner une classe</option>
            {classes.map(c => (
              <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
            ))}
          </select>
          <button onClick={loadBulletins} className="btn-admin text-sm py-1.5 px-3"><RefreshCw size={16}/> Actualiser</button>
          <button className="btn-admin text-sm py-1.5 px-3"><Download size={16}/> Export PDF</button>
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
              <th className="px-3 py-3">Élève</th>
              <th className="px-3 py-3">Moyenne Générale</th>
              <th className="px-3 py-3">Rang</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">Chargement...</td></tr>
            ) : bulletins.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  {classe ? "Aucun bulletin disponible pour cette classe et cette évaluation" : "Sélectionnez une classe"}
                </td>
              </tr>
            ) : (
              bulletins.map((b) => (
                <tr key={b.matricule} className="hover:bg-gray-50 transition">
                  <td className="px-3 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><UserIcon size={16}/></div>
                    <div>
                      <p className="font-bold text-gray-800">{b.nom} {b.prenom}</p>
                      <p className="text-xs text-gray-500">Matricule: #{b.matricule}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`font-bold text-lg ${moyenneColor(b.moyenne)}`}>
                      {b.moyenne.toFixed(2)} / 20
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-medium text-gray-700">#{b.rang}</span>
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => loadDetails(b)} className="text-indigo-600 font-bold hover:underline text-sm">Voir détails</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Détail modal */}
      {detailStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Bulletin de {detailStudent.prenom} {detailStudent.nom}
              </h2>
              <button onClick={() => setDetailStudent(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Matricule: #{detailStudent.matricule} — {evaluation}</p>

            {detailStudent.details && detailStudent.details.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-gray-100">
                      <th className="p-2">Matière</th>
                      <th className="p-2 text-center">Note /20</th>
                      <th className="p-2 text-center">Coefficient</th>
                      <th className="p-2 text-center">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {detailStudent.details.map((d, i) => (
                      <tr key={i}>
                        <td className="p-2 font-medium text-gray-700">{d.matiere}</td>
                        <td className={`p-2 text-center font-bold ${moyenneColor(d.valeur)}`}>{d.valeur.toFixed(2)}</td>
                        <td className="p-2 text-center text-gray-500">{d.coefficient}</td>
                        <td className="p-2 text-center text-gray-700">{(d.valeur * d.coefficient).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 font-bold">
                      <td className="p-2">Total</td>
                      <td className="p-2 text-center">{detailStudent.moyenne.toFixed(2)} / 20</td>
                      <td className="p-2 text-center">{detailStudent.totalCoeffs}</td>
                      <td className="p-2 text-center">{detailStudent.totalPoints.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-6">Aucune note disponible.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulletinPage;
