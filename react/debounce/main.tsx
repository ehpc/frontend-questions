import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useDebounce } from './question1';
import { useDebounceCallback } from './question2';

function App() {
  const [value, setValue] = useState(0);
  const increment = () => setValue(value => value + 1);
  const debouncedValue = useDebounce(value, 1000);
  const incrementDebounced = useDebounceCallback(increment, 1000);

  return (
    <div>
      <h2>useDebounce</h2>
      <div>value: {value}</div>
      <div>debounced value: {debouncedValue}</div>
      <button type="button" onClick={increment}>Increment</button>

      <h2>useDebounceCallback</h2>
      <div>value: {value}</div>
      <button type="button" onClick={incrementDebounced}>Increment</button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);