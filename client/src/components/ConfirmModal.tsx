import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', variant = 'danger', onConfirm, onCancel }: ConfirmModalProps) => {
  const [visible, setVisible] = useState(open);

  useEffect(() => { setVisible(open); }, [open]);

  if (!visible) return null;

  const handleConfirm = () => { setVisible(false); onConfirm(); };
  const handleCancel = () => { setVisible(false); onCancel(); };

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4" onClick={handleCancel}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle size={20} className={variant === 'danger' ? 'text-red-600' : 'text-amber-600'} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{message}</p>
          </div>
          <button onClick={handleCancel} className="ml-auto p-1 hover:bg-gray-100 rounded-full"><X size={16} /></button>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCancel} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition">{cancelLabel}</button>
          <button onClick={handleConfirm} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
