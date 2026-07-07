import { GraduationCap } from 'lucide-react';
import { useLogo } from '../contexts/LogoContext';

interface BrandHeaderProps {
  subtitle: string;
}

const BrandHeader = ({ subtitle }: BrandHeaderProps) => {
  const { logoUrl } = useLogo();
  return (
    <div className="text-center mb-10">
      <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 border border-white/20 overflow-hidden shadow-lg">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo école" className="w-full h-full object-contain p-2" />
        ) : (
          <GraduationCap size={44} className="text-white" />
        )}
      </div>
      <h1 className="text-3xl font-bold text-white tracking-tight">École Excellence</h1>
      <p className="text-sm text-white/60 mt-2">{subtitle}</p>
    </div>
  );
};

export default BrandHeader;
