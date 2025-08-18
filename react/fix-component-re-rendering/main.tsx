import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrokenComponent } from './BrokenComponent';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrokenComponent />
  </React.StrictMode>
);