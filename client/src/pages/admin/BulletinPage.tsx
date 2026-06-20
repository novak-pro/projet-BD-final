import React, { useState, useEffect } from 'react';
import { FileBarChart, Download, Printer, User as UserIcon, RefreshCw, ScrollText } from 'lucide-react';
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
}

const BulletinPage = () => {
  const { t } = useTranslation();
  const [classe, setClasse] = useState("");
  const [evaluation, setEvaluation] = useState("Contrôle continu");
  const [classes, setClasses] = useState<any[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (classe) loadBulletins();
  }, [classe, evaluation]);

  const loadClasses = async () => {
    try {
      const res = await api.get('/enrollments/classes');
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur", err);
    }
  };

  const loadBulletins = async () => {
    if (!classe) return;
    setLoading(true);
    try {
      const res = await api.get(`/bulletins/classe?idClasse=${classe}&evaluation=${encodeURIComponent(evaluation)}`);
      setBulletins(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur", err);
      setBulletins([]);
    } finally {
      setLoading(false);
    }
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
          <select className="border border-gray-200 rounded-[var(--radius)] py-1.5 px-3 text-sm outline-none focus:border-[var(--accent)]" value={evaluation} onChange={e => setEvaluation(e.target.value)}>
            <option value="Contrôle continu">Contrôle continu</option>
            <option value="Examen Trimestriel">Examen Trimestriel</option>
            <option value="Examen Final">Examen Final</option>
          </select>
          <select className="border border-gray-200 rounded-[var(--radius)] py-1.5 px-3 text-sm outline-none focus:border-[var(--accent)]" value={classe} onChange={e => setClasse(e.target.value)}>
            <option value="">Sélectionner une classe</option>
            {classes.map((c: any) => (
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
                    <button className="text-indigo-600 font-bold hover:underline">Voir détails</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BulletinPage;