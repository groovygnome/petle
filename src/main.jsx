import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import logo from './assets/petlelogo.png'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <img src={logo} />
    <App />
  </StrictMode>,
)
