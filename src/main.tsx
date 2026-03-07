import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode >
      <div className="flex flex-col bg-gray-950 min-h-screen w-full">
          <App />
      </div>
  </StrictMode>,
)