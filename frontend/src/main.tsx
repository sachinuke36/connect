import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppContexProvider } from './contexts/Contexts.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './contexts/AuthContexts.tsx'
import { SocketContextProvider } from './contexts/SocketContext.tsx'

createRoot(document.getElementById('root')!).render(
    <AppContexProvider >
    <SocketContextProvider>
      <AuthContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthContextProvider>
    </SocketContextProvider>
    </ AppContexProvider >
  ,
)
