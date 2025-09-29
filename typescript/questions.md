# Type vs interface

## interface

Primarily for describing the shape of objects, classes, and functions.

Can be extended/merged (open-ended).

Good for public API contracts.

## type

Can represent anything: objects, primitives, unions, intersections, etc.

Cannot be merged, but supports advanced compositions like unions/intersections.

More flexible for internal modeling.

```ts
// interface: extendable
interface Person {
  name: string;
}
interface Person {
  age: number;  // merged in
}
const p: Person = { name: "Alice", age: 30 };

// type: no merging, but supports unions
type Status = "success" | "error";
type Response = { code: number } & { message: string };

```

# Union & Intersection Types

```ts
// Union
type Id = number | string;
let userId: Id = 42;
userId = "abc"; // valid

// Intersection
type Person = { name: string };
type Worker = { company: string };
type Employee = Person & Worker;

const e: Employee = { name: "Bob", company: "ACME" };
```

# Literal Types

Instead of just "string" or "number", you can restrict a variable to specific values.

```ts
type Direction = "up" | "down" | "left" | "right";

function move(dir: Direction) {
  console.log(`Moving ${dir}`);
}

move("up");    // ok
move("hello"); // ❌ error
```

They are often used with unions to model enums (without runtime cost).

# Type Narrowing (typeof, in, instanceof)

```ts
function printId(id: number | string) {
  if (typeof id === "string") {
    console.log(id.toUpperCase()); // narrowed to string
  } else {
    console.log(id.toFixed());     // narrowed to number
  }
}
```

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // it's a Fish
  } else {
    animal.fly();  // it's a Bird
  }
}
```

```ts
class Dog { bark() {} }
class Cat { meow() {} }

function sound(pet: Dog | Cat) {
  if (pet instanceof Dog) {
    pet.bark();
  } else {
    pet.meow();
  }
}
```

# any vs unknown vs never

## any
* Opts out of type checking.
* You can do anything with it (dangerous).

```ts
let x: any = "hello";
x.foo.bar.baz(); // compiles, may crash at runtime
```

## unknown
* Safer alternative to any.
* You must narrow it before use.
* It’s the **top type** (a supertype of all types).

```ts
let y: unknown = "hello";
// y.toUpperCase(); ❌ error
if (typeof y === "string") {
  console.log(y.toUpperCase()); // ok
}
```

## never
* Represents values that never happen.
* Used in exhaustive checks and functions that don’t return.
* It’s the **bottom type** (a subtype of all types).
* Functions returning never → they never complete normally (either throw or loop forever).
* Useful in exhaustive checks.

```ts
function fail(msg: string): never {
  throw new Error(msg);
}

type Shape = "circle" | "square";
function area(s: Shape): number {
  switch (s) {
    case "circle": return 1;
    case "square": return 2;
    default: 
      // if Shape is fully covered, s is never here
      const _exhaustive: never = s;
      return _exhaustive;
  }
}
```

## never vs unknown

```
           unknown
              ^
              |
   string  number  object ...
              |
             never

   any (escape hatch, assignable both ways)

```

# Why does TypeScript allow never to be assigned to anything?

* Every type can accept values of its subtypes.
* Since never has no values, it’s a subtype of all types.


# Define a type for a User that can be either "admin" with permissions: string[] or "guest" with no permissions.

```ts
type User =
  | { type: "admin"; permissions: string[] }
  | { type: "guest"; permissions?: never };

const u1: User = { type: "admin", permissions: ["read", "write"] }; // ✅
const u2: User = { type: "guest" }; // ✅

const u3: User = { type: "guest", permissions: [] }; 
// ❌ Error: permissions is not allowed
```

# Type guards vs narrowing

* Narrowing = the general process (TS refines a type based on evidence).
* Type guard = a specific tool (user-defined predicate) that causes narrowing.

Think of it like this:

`Narrowing is the effect, type guards are one of the causes.`

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim(); // narrowed to Fish
  } else {
    pet.fly();  // narrowed to Bird
  }
}
```

# Why `as` is bad and how to avoid it

Short answer: as skips type safety. Use it sparingly, only when you truly 
know more than the compiler — and prefer patterns that prove types 
instead of pretending.

* No runtime check

```ts
const x = "42" as number; // compiles 🤡, explodes later
```

* Silences real bugs

```ts
type User = { id: number };
const u = {} as User;     // compiles, but u.id is undefined at runtime
```

* Double assertion hacks
```ts
fetch("/api").then(r => r.json() as unknown as MyType); // don’t.
```

* Locks you out of narrowing

Once you assert, TS stops helping you refine the value with control-flow analysis.

* Encourages “wishful typing”

Especially with DOM/JSON where values are inherently uncertain.

## Alternatives

* Use narrowing (typeof, instanceof, in)
* Write type guards
* Prefer unknown to any for untrusted data
* Parse/validate with a schema (runtime checks)
* Use satisfies (great for config objects)
* Use generics & constraints instead of asserting
* Overloads for API shapes
* as const (the good as)
* Non-null checks (avoid ! when possible)

# `satisfies`

The `satisfies` operator lets us validate that the type of an expression 
matches some type, without changing the resulting type of that expression. 
As an example, we could use satisfies to validate that all the properties 
of palette are compatible with string | number[]:

```ts
type Colors = "red" | "green" | "blue";
type RGB = [red: number, green: number, blue: number];
const palette = {
    red: [255, 0, 0],
    green: "#00ff00",
    bleu: [0, 0, 255]
//  ~~~~ The typo is now caught!
} satisfies Record<Colors, string | RGB>;
// toUpperCase() method is still accessible!
const greenNormalized = palette.green.toUpperCase();
```

# Write a function that accepts either a string or number and returns its length.

```ts
function lengthOf(value: string | number): number {
  if (typeof value === "string") {
    return value.length;          // string has .length
  } else {
    return value.toString().length; // number → convert to string
  }
}
```

# Explain why this errors:
```ts
let x: unknown = "hi";
console.log(x.toUpperCase()); // ?
```

* x is declared as unknown.
* unknown is the top type in TypeScript → it can hold any value, 
but you cannot use it directly.
* The compiler doesn’t know if x is a string, number, object, etc.
* So it blocks you from calling .toUpperCase() (since not all types have that method).

# Utility Types

```ts
interface User { id: number; name: string; }
type PartialUser = Partial<User>;
// { id?: number; name?: string; }

type UserPreview = Pick<User, "id">;
// { id: number }

type UserWithoutName = Omit<User, "name">;
// { id: number }

type Role = "admin" | "guest";
type Permissions = Record<Role, string[]>;
// { admin: string[]; guest: string[] }
```

```ts
type Status = "success" | "error" | "pending";
// remove "pending"
type NonPending = Exclude<Status, "pending">;
// "success" | "error"
let a: NonPending = "success";  // ✅
let b: NonPending = "pending";  // ❌


type Event = "click" | "change" | "hover";
// keep only common values
type InputEvents = Extract<Event, "change" | "input">;
// "change"
let e: InputEvents = "change"; // ✅


interface User {
  id: number;
  name?: string;
}
type StrictUser = Required<User>;
// { id: number; name: string }
const u1: StrictUser = { id: 1, name: "Alice" }; // ✅
const u2: StrictUser = { id: 2 }; // ❌ missing name
```

# Implement pluck<T, K extends keyof T>(arr: T[], key: K): T[K][]

```ts
function pluck<T, K extends keyof T>(arr: T[], key: K): T[K][] {
  return arr.map(item => item[key]);
}

interface User {
  id: number;
  name: string;
  active: boolean;
}

const users: User[] = [
  { id: 1, name: "Alice", active: true },
  { id: 2, name: "Bob", active: false },
];

// pluck "name" → string[]
const names = pluck(users, "name");
// names: string[]

// pluck "id" → number[]
const ids = pluck(users, "id");
// ids: number[]

// ❌ invalid key
const wrong = pluck(users, "age");
// Error: Argument of type '"age"' is not assignable to parameter of type '"id" | "name" | "active"'

```

# Write DeepPartial<T>

```ts
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object 
    ? DeepPartial<T[P]> 
    : T[P];
};
```

# Create a Dictionary<T> type that maps string keys to T

```ts
type Dictionary<T> = {
  [key: string]: T;
};

type Dictionary<T> = Record<string, T>;
```

# Discriminated Unions

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side * shape.side;
  }
}

const c: Shape = { kind: "circle", radius: 10 };
```

# Mapped Types

```ts
interface User {
  id: number;
  name: string;
  active: boolean;
}

// Make everything optional
type PartialUser = {
  [K in keyof User]?: User[K];
};

// Make all properties readonly
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};

// Convert all properties to strings
type Stringify<T> = {
  [K in keyof T]: string;
};
```

# Conditional Types and `infer`

```ts
type ElementType<T> = T extends (infer U)[] ? U : T;

type A = ElementType<string[]>; // string
type B = ElementType<number>;   // number
```

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Fn = () => Promise<number>;
type R = ReturnType<Fn>; // Promise<number>
```

# Define a discriminated union for a shape (circle, square, triangle) with different fields. Write a function getArea(shape) with exhaustive type checking.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "triangle"; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;

    case "square":
      return shape.side * shape.side;

    case "triangle":
      return (shape.base * shape.height) / 2;

    default: {
      // Exhaustive check
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}
```

# Create a type ReturnType<T> manually (like TS built-in).

```ts

// MyReturnType: extracts the return type of a function type
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// https://github.com/microsoft/TypeScript/blob/1cd5309f7dec081960e992b47f238286537c3f50/src/lib/es5.d.ts#L1632
type ReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => infer R ? R : never;
```

# Distributive Conditional Types

When conditional types act on a generic type, they become distributive 
when given a union type. For example, take the following:

```ts
type ToArray<Type> = Type extends any ? Type[] : never;
 
type StrArrOrNumArr = ToArray<string | number>;
           
// type StrArrOrNumArr = string[] | number[]
```

Typically, distributivity is the desired behavior. To avoid that behavior, 
you can surround each side of the extends keyword with square brackets.

```ts
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;
 
// 'ArrOfStrOrNum' is no longer a union.
type ArrOfStrOrNum = ToArrayNonDist<string | number>;
          
// type ArrOfStrOrNum = (string | number)[]
```
