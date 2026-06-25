import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import fr from './fr.json';
import en from './en.json';

type Lang = 'fr' | 'en';
type Translations = Record<string, string>;

const translations: Record<Lang, Translations> = { fr, en };

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'fr' || saved === 'en') ? saved : 'fr';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['fr']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
