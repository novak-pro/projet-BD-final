import { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import api from '../../services/axiosInstance';
import { notifySuccess, notifyError } from '../../utils/notifications';
import SubmitBtn from '../../components/SubmitBtn';
import Spinner from '../../components/Spinner';

interface MessageItem {
  id: number;
  content: string;
  status: string;
  createdAt: string;
  recipient: { id: number; email: string } | null;
}

const TeacherMessages = () => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [salleInfo, setSalleInfo] = useState<{ libelle: string; classe: string } | null>(null);
  const [isTitulaire, setIsTitulaire] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/cours/mes-cours').then((res: any) => {
        const data = res.data;
        const salles = data.salleTitulaire || [];
        if (salles.length > 0) {
          setIsTitulaire(true);
          const s = salles[0];
          setSalleInfo({ libelle: s.libelle, classe: s.classe?.libelle || s.libelle });
        }
      }).catch(() => {}),
      api.get('/messages').then((res: any) => {
        setMessages(Array.isArray(res.data) ? res.data.filter((m: any) => m.type === 'PERSONAL') : []);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return notifyError('Écrivez un message');
    setSubmitting(true);
    try {
      const res = await api.post('/messages/teacher', { content });
      notifySuccess(res.data?.message || 'Message soumis pour validation');
      setContent('');
      const msgRes = await api.get('/messages');
      setMessages(Array.isArray(msgRes.data) ? msgRes.data.filter((m: any) => m.type === 'PERSONAL') : []);
    } catch (err: any) {
      notifyError(err?.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle size={14} className="text-green-600" />;
      case 'REJECTED': return <XCircle size={14} className="text-red-600" />;
      case 'PENDING': return <Clock size={14} className="text-amber-500" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Approuvé';
      case 'REJECTED': return 'Rejeté';
      case 'PENDING': return 'En attente';
      default: return status;
    }
  };

  if (loading) return <Spinner text="Chargement..." />;

  if (!isTitulaire) {
    return (
      <div className="space-y-6">
        <div className="admin-card max-w-2xl">
          <div className="admin-card-header">
            <h2>
              <MessageSquare size={18} style={{ color: 'var(--navy)' }} />
              Messagerie parents
            </h2>
          </div>
          <div className="flex flex-col items-center py-12 text-gray-400 gap-3">
            <AlertTriangle size={32} />
            <p className="text-sm font-medium">Seuls les enseignants titulaires peuvent envoyer des messages aux parents.</p>
            <p className="text-xs">Contactez l'administration pour être nommé titulaire d'une salle.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="admin-card max-w-2xl">
        <div className="admin-card-header">
          <h2>
            <MessageSquare size={18} style={{ color: 'var(--navy)' }} />
            Messagerie parents
          </h2>
          {salleInfo && (
            <p className="text-xs text-gray-400">
              Classe : <strong>{salleInfo.classe}</strong> — Salle : <strong>{salleInfo.libelle}</strong>
            </p>
          )}
        </div>

        <form onSubmit={handleSend} className="admin-form">
          <div className="admin-field">
            <label>Message à envoyer aux parents des élèves de votre classe</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-[var(--radius)] outline-none text-sm min-h-[150px] resize-y"
              placeholder="Rédigez votre message ici... (il sera soumis à validation par l'administration)"
              required
              maxLength={2000}
            />
          </div>
          <SubmitBtn
            loading={submitting}
            text={<span className="flex items-center gap-2"><Send size={14} /> Envoyer</span>}
            loadingText="Envoi en cours..."
          />
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Historique des messages</h2>
        </div>
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Aucun message envoyé.</p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="mt-0.5">{statusIcon(msg.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{msg.content}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      msg.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      msg.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {statusLabel(msg.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMessages;
