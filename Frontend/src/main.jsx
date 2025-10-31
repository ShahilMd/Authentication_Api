import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import { AppProvider } from './Context/AppContext.jsx'

export const server = 'https://authentication-api-backend-kb8e.onrender.com'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider> 
  </StrictMode>,
)
