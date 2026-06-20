import { GraduationCap } from 'lucide-react';

interface BrandHeaderProps {
  subtitle: string;
}

const BrandHeader = ({ subtitle }: BrandHeaderProps) => (
  <div className="text-center mb-8">
    <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/20">
      <GraduationCap size={26} className="text-white" />
    </div>
    <h1 className="text-2xl font-bold text-white tracking-tight">EduManager</h1>
    <p className="text-sm text-white/60 mt-1.5">{subtitle}</p>
  </div>
);

export default BrandHeader;
