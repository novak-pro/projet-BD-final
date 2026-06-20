import { useTranslation } from '../i18n/LanguageContext';

const LanguageSwitcher = ({ className = '' }: { className?: string }) => {
  const { lang, setLang } = useTranslation();

  return (
    <button
      onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
      className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider hover:opacity-80 transition-opacity ${className}`}
      title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <span className={`${lang === 'fr' ? 'text-white' : 'text-white/50'}`}>FR</span>
      <span className="text-white/30">|</span>
      <span className={`${lang === 'en' ? 'text-white' : 'text-white/50'}`}>EN</span>
    </button>
  );
};

export default LanguageSwitcher;
