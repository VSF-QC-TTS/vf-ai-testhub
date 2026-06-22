import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './app/providers/I18nProvider.tsx'
import { QueryProvider } from './app/providers/QueryProvider.tsx'

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') {
    return
  }

  const { worker } = await import('./mocks/browser')

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nProvider>
        <QueryProvider>
          <Toaster position="top-right" richColors />
          <App />
        </QueryProvider>
      </I18nProvider>
    </StrictMode>,
  )
});
