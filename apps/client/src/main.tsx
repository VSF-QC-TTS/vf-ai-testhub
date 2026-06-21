import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './app/providers/I18nProvider.tsx'
import { QueryProvider } from './app/providers/QueryProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <QueryProvider>
        <App />
      </QueryProvider>
    </I18nProvider>
  </StrictMode>,
)
