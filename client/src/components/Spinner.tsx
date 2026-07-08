import { Loader2 } from 'lucide-react';

const Spinner = ({ text = 'Chargement...' }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    <span className="text-sm font-medium">{text}</span>
  </div>
);

export default Spinner;
