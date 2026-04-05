import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AnalysisView from './views/AnalysisView.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AnalysisView />
  </StrictMode>,
);
