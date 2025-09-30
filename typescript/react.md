# Typing Children (ReactNode vs JSX.Element)

## ReactNode

* A union type covering anything React can render: strings, numbers, 
fragments, arrays, portals, etc.
* Use when you expect any renderable content.

```ts
type CardProps = { children: React.ReactNode };

const Card = ({ children }: CardProps) => (
  <div className="card">{children}</div>
);
```

## JSX.Element

* A single React element (what you get from writing <div />).
* More restrictive: not arrays, not strings, not null.

```ts
type StrictProps = { children: JSX.Element };

const Wrapper = ({ children }: StrictProps) => <div>{children}</div>;

// <Wrapper><span /></Wrapper> ✅
// <Wrapper>{"hello"}</Wrapper> ❌
```

👉 Rule of thumb:

* Use ReactNode for flexible children (most cases).
* Use JSX.Element when you require exactly one element.

# Typing Event Handlers

React redefines DOM events with its own wrappers (SyntheticEvent).

```ts
import React, { ChangeEvent, MouseEvent } from "react";

// Input change
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

// Button click
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  console.log("clicked");
};
```

# useReducer

```ts
type State = { count: number };
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset"; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment": return { count: state.count + 1 };
    case "decrement": return { count: state.count - 1 };
    case "reset": return { count: action.payload };
    default: {
      const _exhaustive: never = action; // ❌ error if a case is unhandled
      return state;
  }
}

const [state, dispatch] = React.useReducer(reducer, { count: 0 });

dispatch({ type: "reset", payload: 10 }); // ✅
dispatch({ type: "foo" }); // ❌
```

# Create a Button component that accepts:
```
variant: "primary" | "secondary".
onClick: () => void
```

```ts
import React from "react";

type ButtonProps = {
  variant?: "primary" | "secondary";
  onClick: () => void;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  onClick,
  children,
}: ButtonProps) {
  const className = variant === "primary" ? "btn btn-primary" : "btn btn-secondary";

  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}
```

# Write a hook useLocalStorage<T>(key: string, initial: T): [T, (val: T) => void]

```ts
import { useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });

  const set = (val: T) => {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  };

  return [value, set];
}
```

# Type a reducer for a todo app:
```ts
type Action = { type: "add"; text: string } | { type: "remove"; id: number }
```

```ts
type Todo = {
  id: number;
  text: string;
};

type Action =
  | { type: "add"; text: string }
  | { type: "remove"; id: number };

function todoReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add":
      return [
        ...state,
        { id: Date.now(), text: action.text } // new todo
      ];

    case "remove":
      return state.filter(todo => todo.id !== action.id);

    default: {
      // exhaustive check
      const _exhaustive: never = action;
      return state;
    }
  }
}
```
