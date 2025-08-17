import React from 'react';
import { createRoot } from 'react-dom/client';
import ItemsComponent from './ItemsComponent';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ItemsComponent />
  </React.StrictMode>
);