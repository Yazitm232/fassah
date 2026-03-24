import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
 
// Admin panel removed from public URL for security.
// Use Supabase dashboard to approve/reject spaces:
// supabase.com → your project → Table Editor → spaces → filter verified=false
 
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
 
