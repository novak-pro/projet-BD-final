import React, { useState, useEffect } from 'react';
import { Book, BookOpen, Search } from 'lucide-react';
import api from '../services/axiosInstance';
import { useTranslation } from '../i18n/LanguageContext';
import Spinner from '../components/Spinner';

interface Livre {
  id: number;
  titre: string;
  auteur: string;
  cycle: string;
  classeConcernee: string;
  langue: string;
  couvertureUrl: string | null;
  pdfUrl: string | null;
  matiere: { id: number; nom: string };
}

const cycles = ['Premier cycle', 'Deuxieme cycle', 'Troisieme cycle'];

const ParentBibliotheque = () => {
  const { t } = useTranslation();
  const [livres, setLivres] = useState<Livre[]>([]);
  const [search, setSearch] = useState('');
  const [filterCycle, setFilterCycle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLivres();
  }, []);

  const loadLivres = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bibliotheque');
      setLivres(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = livres.filter(l => {
    if (search && !`${l.titre} ${l.auteur}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCycle && l.cycle !== filterCycle) return false;
    return true;
  });

  if (loading) return <Spinner text="Chargement de la bibliothèque..." />;

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <Book size={18} style={{ color: 'var(--navy)' }} />
          Bibliotheque scolaire
        </h2>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
            <Search size={15} className="text-gray-400" />
          </div>
          <input className="flex-1 px-3 py-2 border border-gray-200 rounded-[var(--radius)] outline-none text-sm focus:border-[var(--accent)]" placeholder="Rechercher un livre..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="border border-gray-200 rounded-[var(--radius)] py-2 px-3 text-sm outline-none" value={filterCycle} onChange={e => setFilterCycle(e.target.value)}>
          <option value="">Tous les cycles</option>
          {cycles.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(livre => (
          <div key={livre.id} className="bg-white rounded-[var(--radius-lg)] border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
              {livre.couvertureUrl ? (
                <img src={livre.couvertureUrl} alt={livre.titre} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={48} style={{ color: 'var(--navy)', opacity: 0.3 }} />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 truncate">{livre.titre}</h3>
              <p className="text-sm text-gray-500">{livre.auteur}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="admin-badge" style={{ background: 'var(--accent-light)', color: 'var(--navy)' }}>{livre.matiere?.nom}</span>
                <span className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded">{livre.cycle}</span>
                <span className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded">{livre.classeConcernee}</span>
              </div>
              {livre.pdfUrl && (
                <div className="mt-3">
                  <a href={livre.pdfUrl} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline flex items-center gap-1" style={{ color: 'var(--navy)' }}>
                    <BookOpen size={14}/> Lire le PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Book size={48} className="mx-auto mb-3 text-gray-200"/>
            <p>Aucun livre disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentBibliotheque;
