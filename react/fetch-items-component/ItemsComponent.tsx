import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Item {
  id: number;
  name: string;
}

interface APIResponse {
  result: {
    code: number;
    items: Item[];
  };
}

interface ItemRowProps {
  name: Item['name'];
}

const apiUrl = '/api/items';

function ItemRow({ name }: ItemRowProps) {
  return (<span><strong>{name}</strong></span>);
}

export default function ItemsComponent() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadItems = useCallback(async () => {
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl, { signal: abortController.signal });
      if (!response.ok) throw new Error(`Bad response ${response.status}.`);
      const data: APIResponse = await response.json();
      setItems(data.result.items);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setError(error instanceof Error ? error.message : 'Unknown error.');
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    loadItems();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadItems]);

  if (isLoading || !items) {
    return (<div>Loading data...</div>);
  }

  if (error) {
    return (<div>Error: {error}</div>);
  }

  return (
    <article>
      <h1>Items</h1>
      {!items.length && (<div>No items.</div>)}
      {items.length > 0 && (
        <ul>
          {items.map(({ id, name }) => (
            <li key={id}>
              <ItemRow name={name} />
            </li>
          ))}
        </ul>
      )}
      <button onClick={loadItems} disabled={isLoading}>Reload</button>
    </article>
  );
}
