import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Admin from './pages/Admin';
import './index.css';
 
const isAdmin = window.location.search.includes('admin=true');
 
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <Admin /> : <App />}
  </StrictMode>
);
 
