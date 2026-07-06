import { useState, useEffect } from 'react';
import { Send, MessageSquare, AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';
import api from '../../services/axiosInstance';
import { useTranslation } from '../../i18n/LanguageContext';
import { notifySuccess, notifyError } from '../../utils/notifications';
import ConfirmModal from '../../components/ConfirmModal';

interface Parent {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface Message {
  id: number;
  content: string;
  type: string;
  status: string;
  sender: { id: number; email: string };
  recipient?: { id: number; email: string };
  createdAt: string;
}

const AdminMessages = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'announce' | 'personal' | 'pending'>('announce');
  const [content, setContent] = useState('');
  const [parents, setParents] = useState<Parent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/messages/parents').then(res => setParents(res.data)).catch(() => {});
    loadPending();
  }, []);

  const loadPending = () => {
    api.get('/messages').then(res => setPendingMessages(res.data)).catch(() => {});
  };

  const filteredParents = parents.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendAnnouncement = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post('/messages/announcement', { content });
      setContent('');
      notifySuccess('Annonce envoyée à tous les parents');
    } catch { notifyError("Erreur d'envoi"); }
    setSending(false);
  };

  const handleSendPersonal = async () => {
    if (!content.trim() || !selectedParent) return;
    setSending(true);
    try {
      await api.post('/messages/personal', { content, recipientId: selectedParent.id });
      setContent('');
      setSelectedParent(null);
      notifySuccess('Message envoyé');
    } catch { notifyError("Erreur d'envoi"); }
    setSending(false);
  };

  const handleModerate = async (id: number, status: string) => {
    try {
      await api.patch(`/messages/${id}/moderate`, { status });
      loadPending();
    } catch { notifyError("Erreur de modération"); }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>
          <MessageSquare size={18} style={{ color: 'var(--navy)' }} />
          Messagerie
        </h2>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'announce', label: 'Annonces' },
          { key: 'personal', label: 'Message personnel' },
          { key: 'pending', label: `En attente (${pendingMessages.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[var(--navy)] text-white shadow-md'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'announce' && (
        <div>
          <p className="text-sm text-gray-500 mb-3">Envoyer une annonce à <strong>tous les parents</strong></p>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none resize-none focus:border-[var(--navy)] transition-colors"
            rows={4}
            placeholder="Écrivez votre annonce ici..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button
            onClick={handleSendAnnouncement}
            disabled={sending || !content.trim()}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold bg-[var(--navy)] hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Send size={16} />
            {sending ? 'Envoi...' : 'Envoyer l\'annonce'}
          </button>
        </div>
      )}

      {activeTab === 'personal' && (
        <div>
          <p className="text-sm text-gray-500 mb-3">Envoyer un message à <strong>un parent spécifique</strong></p>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
              <Search size={15} className="text-gray-400" />
            </div>
            <input
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm focus:border-[var(--navy)]"
              placeholder="Rechercher un parent..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {search && (
            <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
              {filteredParents.length === 0 ? (
                <div className="p-3 text-sm text-gray-400">Aucun parent trouvé</div>
              ) : (
                filteredParents.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedParent(p); setSearch(''); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      selectedParent?.id === p.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    {p.prenom} {p.nom}
                    <span className="text-gray-400 ml-2">({p.email})</span>
                  </button>
                ))
              )}
            </div>
          )}

          {selectedParent && (
            <div className="mb-4 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium">Destinataire : {selectedParent.prenom} {selectedParent.nom}</span>
              <button onClick={() => setSelectedParent(null)} className="text-xs text-red-500 hover:underline">Changer</button>
            </div>
          )}

          <textarea
            className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none resize-none focus:border-[var(--navy)] transition-colors"
            rows={4}
            placeholder="Écrivez votre message..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button
            onClick={handleSendPersonal}
            disabled={sending || !content.trim() || !selectedParent}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold bg-[var(--navy)] hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Send size={16} />
            {sending ? 'Envoi...' : 'Envoyer le message'}
          </button>
        </div>
      )}

      {activeTab === 'pending' && (
        <div>
          <p className="text-sm text-gray-500 mb-3">Messages d'enseignants en attente de validation</p>
          {pendingMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle size={40} className="mx-auto mb-3 text-gray-200" />
              <p>Aucun message en attente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMessages.map(msg => (
                <div key={msg.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-400">De : {msg.sender.email}</p>
                      <p className="text-xs text-gray-400">Pour : {msg.recipient?.email || 'Inconnu'}</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">En attente</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{msg.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModerate(msg.id, 'APPROVED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle size={14} /> Approuver
                    </button>
                    <button
                      onClick={() => handleModerate(msg.id, 'REJECTED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <XCircle size={14} /> Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
