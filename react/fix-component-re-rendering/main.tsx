import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrokenComponent } from './BrokenComponent';
import { FixedComponent } from './FixedComponent';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrokenComponent />
    <FixedComponent />
  </React.StrictMode>
);