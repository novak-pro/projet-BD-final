import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Mail, Megaphone, X } from 'lucide-react';
import api from '../services/axiosInstance';

interface Message {
  id: number;
  content: string;
  type: string;
  status: string;
  sender: { id: number; email: string };
  createdAt: string;
}

const InboxDropdown = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    api.get('/messages')
      .then(res => setMessages(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  };

  useEffect(() => {
    if (open) fetchMessages();
  }, [open]);

  // Poll every 10s for new messages so badge stays current
  useEffect(() => {
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Boîte de réception"
      >
        <MessageSquare size={18} className="text-gray-600" />
        {messages.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {messages.length > 9 ? '9+' : messages.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Boîte de réception</p>
            <span className="text-[10px] text-gray-400">{messages.length} message{messages.length > 1 ? 's' : ''}</span>
          </div>
          {messages.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <Mail size={24} className="mx-auto mb-2 text-gray-200" />
              Aucun message
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-2">
                  {msg.type === 'ANNOUNCEMENT' ? (
                    <Megaphone size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  ) : (
                    <Mail size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      {msg.type === 'ANNOUNCEMENT' ? 'Annonce' : 'Message personnel'}
                    </p>
                    <p className="text-sm text-gray-700">{msg.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default InboxDropdown;
