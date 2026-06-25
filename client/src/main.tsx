import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LogoProvider } from './contexts/LogoContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <LogoProvider>
          <App />
        </LogoProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>,
)
