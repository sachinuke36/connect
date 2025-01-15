// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppContexProvider } from './contexts/Contexts.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './contexts/AuthContexts.tsx'
import { SocketContextProvider } from './contexts/SocketContext.tsx'
// import { WebRTCContextProvider } from './contexts/WebRTCContext.tsx'

createRoot(document.getElementById('root')!).render(
    <AppContexProvider >
      {/* <WebRTCContextProvider> */}
    <SocketContextProvider>
      <AuthContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthContextProvider>
    </SocketContextProvider>
    {/* </WebRTCContextProvider> */}
    </ AppContexProvider >
  ,
)
