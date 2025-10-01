# Implement a controlled <Input /> component.

```ts
import React from "react";

type InputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function Input({ value, onChange, placeholder }: InputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Form() {
  const [name, setName] = React.useState("");

  return (
    <>
      <Input value={name} onChange={setName} />
      <p>You typed: {name}</p>
    </>
  );
}
```

# Render a list of items with unique keys. Explain what happens if you use index as key.

```ts
type Item = { id: string; label: string };

function ItemList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map((it) => (
        <li key={it.id}>{it.label}</li>   {/* stable, unique key */}
      ))}
    </ul>
  );
}
```

* React uses keys to match elements between renders (reconciliation).

* With stable keys, React can preserve state, move items efficiently, 
and only update what changed.

# Build a component that conditionally shows a spinner while loading data.

```ts
import React from "react";

type Data = { id: number; name: string };

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function DataLoader() {
  const [data, setData] = React.useState<Data[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const ac = new AbortController();
    let finished = false;

    (async () => {
      try {
        // Optional client-side timeout (AbortSignal.timeout is supported in modern browsers)
        // const signal = AbortSignal.any([ac.signal, AbortSignal.timeout(10000)]);
        const res = await fetch("/api/data", { signal: ac.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json: Data[] = await res.json();
        if (!finished) setData(json);
      } catch (e) {
        // Ignore aborts; they’re expected on unmount/refresh
        if ((e as any)?.name === "AbortError") return;
        if (!finished) setError(getErrorMessage(e));
      } finally {
        if (!finished) setLoading(false);
      }
    })();

    return () => {
      finished = true;
      ac.abort();
    };
  }, []);

  if (loading) return <Spinner ariaLabel="Loading data" />;
  if (error) return <ErrorBox message={error} />;
  if (!data?.length) return <EmptyState />;

  return (
    <ul aria-busy="false">
      {data.map((d) => (
        <li key={d.id}>{d.name}</li>
      ))}
    </ul>
  );
}

function Spinner({ ariaLabel = "Loading…" }: { ariaLabel?: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={ariaLabel}>
      Loading…
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return <div role="alert">Error: {message}</div>;
}

function EmptyState() {
  return <div>No items yet.</div>;
}
```

# Write a custom hook useFetch(url) that fetches JSON and returns { data, loading, error }.

```ts
import React from "react";

type FetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useFetch<T = unknown>(url: string): FetchResult<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!url) return;

    const ac = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: T = await res.json();
        setData(json);
      } catch (e: unknown) {
        if ((e as any)?.name === "AbortError") return; // ignore aborts
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => ac.abort();
  }, [url]);

  return { data, loading, error };
}
```

# Write a counter with useReducer (actions: "increment" | "decrement").

```ts
import React from "react";

type Action = { type: "increment" } | { type: "decrement" };
type State = { count: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default: {
      // Exhaustive check
      const _exhaustive: never = action;
      return state;
    }
  }
}

export function Counter() {
  const [state, dispatch] = React.useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
    </div>
  );
}
```

# Create a ThemeContext with "light"/"dark". Toggle theme in a nested component.

```ts
import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemeToggler() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <div>
        <h1>Theme Demo</h1>
        <ThemeToggler /> {/* nested toggle */}
      </div>
    </ThemeProvider>
  );
}
```

# Virtual DOM diffing (Reconciliation)

* React keeps a virtual DOM: a lightweight in-memory representation of the UI.
* On re-render:
  * Compares new vs old trees.
  * Uses heuristics:
    * Different element type (<div> → <span>) → replace subtree.
    * Same type but changed props → update attributes only.
    * Lists → uses keys to match children and reorder efficiently.
* This makes updates fast — only minimal real DOM operations are done.

👉 Keys matter because without stable keys, React destroys/recreates elements instead of reusing them.

# Lazy Loading & Code Splitting

```ts
const LazyComponent = React.lazy(() => import("./BigComponent"));

function App() {
  return (
    <React.Suspense fallback={<div>Loading…</div>}>
      <LazyComponent />
    </React.Suspense>
  );
}
```

}

* The component chunk is only downloaded when rendered.
* Works well with routing (e.g. load page code only when route matches).

# Explain why useMemo might not help in some cases.

* Computation is cheap
* Deps change every render
* Child re-renders for other reasons
* Premature optimization / readability hit

# How to render a list of 10k rows efficiently?

* Use list virtualization/windowing so only the visible rows (plus a small 
buffer) are mounted. 
*Libraries: react-window (lean), react-virtualized (feature-rich).*

* Keep row props stable (React.memo row, stable handlers via itemData), 
and use stable keys.

* Prefer fixed row height (fast!). For variable height, measure and use VariableSizeList.

* Tune overscan: small enough for perf, big enough to avoid scroll jank.

* Avoid heavy work in rows: no expensive effects, lazy-load images, 
no inline new objects if you pass them to memoized children.

* If you must render everything (rare), use pagination instead.

# Implement simple virtual list

```ts
import React from "react";

export function MiniVirtualList({
  rowHeight = 36,
  height = 400,
  items,
  renderRow,
  overscan = 5,
}: {
  rowHeight?: number; height?: number; overscan?: number;
  items: any[]; renderRow: (item: any, idx: number) => React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  const total = items.length * rowHeight;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visCount = Math.ceil(height / rowHeight) + overscan * 2;
  const end = Math.min(items.length, start + visCount);
  const slice = items.slice(start, end);

  return (
    <div
      ref={ref}
      style={{ height, overflow: "auto", position: "relative", border: "1px solid #ddd" }}
      onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
    >
      <div style={{ height: total, position: "relative" }}>
        {slice.map((item, i) => {
          const idx = start + i;
          return (
            <div key={idx} style={{
              position: "absolute",
              top: idx * rowHeight,
              height: rowHeight, left: 0, right: 0, display: "flex", alignItems: "center", padding: "0 8px"
            }}>
              {renderRow(item, idx)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

# Type a custom hook useLocalStorage<T>.

```ts
import React from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = React.useCallback((newValue: T) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch {
      // ignore write errors (quota, etc.)
    }
  }, [key]);

  return [value, setStoredValue] as const;
}
```

# Difference between client-side rendering, server-side rendering, hydration?

## Client-Side Rendering (CSR)

* Browser downloads a mostly empty HTML shell (<div id="root"></div>).
* Loads JavaScript bundle.
* React runs in the browser, builds the DOM, and paints UI.
* First paint can be slower because user waits for JS to load + execute.
* SEO can suffer (unless crawlers support JS).

## Server-Side Rendering (SSR)

* Server runs React on the server → sends fully rendered HTML to client.
* Browser shows content immediately (fast first paint, SEO-friendly).
* But the HTML is static; it doesn’t yet respond to events (buttons don’t work).
* React must still load JS and attach event listeners → that step is hydration.

## Hydration

* The process where React attaches event listeners to already-rendered HTML.
* React doesn’t re-render the whole UI — it walks the DOM, matches nodes, 
and hooks up event handling.
* Needed because SSR gave us HTML but no interactivity.
* If server HTML ≠ client render → hydration errors/warnings.

## Static Site Generation (SSG)

* Pages are pre-rendered at build time (e.g. during next build).
* Output is plain HTML files + JSON.
* Very fast — CDN can serve instantly.
* Great for content that doesn’t change often (docs, blogs, marketing pages).
* But not dynamic at runtime — you need a rebuild to update content.

## Incremental Static Regeneration (ISR)

* Hybrid of SSG and SSR, used in Next.js.
* Pages are pre-rendered at build, but can be revalidated in the 
background at runtime after a set time.
*  Allows “mostly static” pages with occasional updates 
without rebuilding the whole site.
