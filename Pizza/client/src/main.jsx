import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import ManagerDashboard from './views/ManagerDashboard.jsx';
import DriverView from './views/DriverView.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManagerDashboard />} />
        <Route path="/driver" element={<DriverView />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
