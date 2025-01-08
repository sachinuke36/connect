import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppContexProvider } from './contexts/Contexts.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './contexts/AuthContexts.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppContexProvider >
      <AuthContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthContextProvider>
    </ AppContexProvider >
  </StrictMode>,
)
