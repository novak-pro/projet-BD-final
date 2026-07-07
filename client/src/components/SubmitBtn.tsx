import { Loader2 } from 'lucide-react';

interface Props {
  loading?: boolean;
  text?: string;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const SubmitBtn = ({ loading, text = 'Enregistrer', loadingText = 'En cours...', className = 'btn-admin justify-center py-2.5', onClick, type = 'submit', disabled }: Props) => (
  <button type={type} onClick={onClick} disabled={disabled || loading} className={`${className} disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2`}>
    {loading && <Loader2 size={16} className="animate-spin" />}
    {loading ? loadingText : text}
  </button>
);

export default SubmitBtn;
