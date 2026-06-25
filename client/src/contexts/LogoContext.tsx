import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface LogoContextType {
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
}

const LogoContext = createContext<LogoContextType>({
  logoUrl: null,
  setLogoUrl: () => {},
});

export const useLogo = () => useContext(LogoContext);

export const LogoProvider = ({ children }: { children: ReactNode }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(() =>
    localStorage.getItem('schoolLogo')
  );

  useEffect(() => {
    if (logoUrl) {
      localStorage.setItem('schoolLogo', logoUrl);
    } else {
      localStorage.removeItem('schoolLogo');
    }
  }, [logoUrl]);

  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl }}>
      {children}
    </LogoContext.Provider>
  );
};
