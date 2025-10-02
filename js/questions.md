# Lexical environment

* Each scope creates an environment record (a map of names → values) + 
a pointer to its outer env.

* On identifier lookup, JS walks the chain outward (no dynamic scope).

* Functions remember the env where they were created 
(that’s the basis for closures).

# Closures (what & why)

* A closure is a function + its captured lexical environment. Classic uses:

  * Private state / encapsulation
  * Partial application / memoization
  * Once / debounce / throttle
  * Loop variable capture

💡 GC note: As long as a closure is reachable, its captured 
variables stay alive.

# this — the binding rules

Five ways this gets set (in priority order):

1. new binding: inside a constructor call new Foo(), this is the newly created object.
2. Explicit binding: fn.call(obj, ...), fn.apply(obj, ...), fn.bind(obj) set this = obj.
3. Implicit binding: obj.method() → this = obj.
4. Default binding: plain fn():
    * sloppy mode: this = global object (window in browsers, global in Node REPL)
    * strict mode: this = undefined
5. Arrow functions: no own this; they lexically inherit this from the creation site.

# Prototype & Inheritance

* Every object has an internal [[Prototype]] (often seen via __proto__).
* Functions have a .prototype object used when called with new.
* Property lookup walks the prototype chain: own props → [[Prototype]] → … → null.

```js
const a = { x: 1 };
const b = Object.create(a); // b.[[Prototype]] = a
b.y = 2;
console.log(b.x, b.y); // 1 2 (x found on prototype)
```

## Object.create(proto, descriptors?)
```js
const base = { kind: 'base' };
const child = Object.create(base, {
  id: { value: 123, writable: false, enumerable: true }
});
```

## `__proto__` vs Object.getPrototypeOf / Object.setPrototypeOf

`__proto__` is a legacy accessor; use the standard functions above in production code.

## “class” is sugar over prototypes

```js
// ES6 class (sugar)
class Animal {
  constructor(name){ this.name = name; }
  speak(){ return `${this.name} makes a noise`; }
}
class Dog extends Animal {
  speak(){ return `${this.name} barks`; }
}

//// Roughly equivalent “old school”
function AnimalFn(name){ this.name = name; }
AnimalFn.prototype.speak = function(){ return `${this.name} makes a noise`; };

function DogFn(name){
  AnimalFn.call(this, name);
}
DogFn.prototype = Object.create(AnimalFn.prototype);
DogFn.prototype.constructor = DogFn;
DogFn.prototype.speak = function(){ return `${this.name} barks`; };
```

## What new actually does

1. Create a fresh object and set its `[[Prototype]]` to `Ctor.prototype`.
2. Call `Ctor` with this bound to that object.
3. If `Ctor` returns an object, use it; otherwise use the created one.

# Write function inherit(Child, Parent)

```js
function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype, {
    constructor: { value: Child, writable: true, configurable: true }
  });
  Object.setPrototypeOf(Child, Parent);
}
```

```js
function Animal(name) { this.name = name; }
Animal.kind = 'animal';
Animal.prototype.say = function() { return this.name; };

function Dog(name) {
  Animal.call(this, name);
}
inherit(Dog, Animal);

const d = new Dog("Rex");
console.log(d.say());           // Rex
console.log(Dog.kind);          // animal
console.log(d instanceof Dog);  // true
console.log(d instanceof Animal); // true
```

# Fix this so it works:
```js
const obj = {
  value: 10,
  logLater() {
    setTimeout(function() {
      console.log(this.value);
    }, 1000);
  }
};
obj.logLater();
```

```js
const obj = {  
  value: 10,  
  logLater() {  
    setTimeout(() => {  
      console.log(this.value);  
    }, 1000);  
  }  
};  
obj.logLater(); // logs 10
```

# Implement a Person constructor with a prototype method sayHi().

```js
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`);
};
```

# Tasks (macrotasks) vs microtasks

* The event loop decides when callbacks run.
* Macrotasks (a.k.a. tasks): scheduled by `setTimeout`, `setInterval`, 
`setImmediate` (Node), DOM events, etc.
* Microtasks: scheduled by `Promise.then/catch/finally`, `queueMicrotask`, `MutationObserver`.

Order:
1. Take 1 macrotask from the macrotask queue (e.g. setTimeout, I/O, event handler)
→ Run it to completion (sync code).
2. Flush all microtasks that were queued during that macrotask.
(Promises, queueMicrotask, MutationObserver.)
3. Rendering / painting (in browsers).
4. Back to step 1.

```js
setTimeout(() => console.log("timeout"), 0); // macrotask
Promise.resolve().then(() => console.log("promise")); // microtask
console.log("sync");

// sync → promise → timeout
```

# Promises

* A Promise represents a value that’s not known yet (pending → fulfilled/rejected).
* .then and .catch handlers always go to the microtask queue.
* Errors inside async functions = rejected promises.

# async/await

* Syntactic sugar over Promises.
* `await` expr pauses function until promise settles, without blocking the stack.
* The rest of the function is scheduled as a microtask.

# Event loop puzzles
```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// 1 4 3 2
```

```js
async function f() {
  console.log("A");
  await null;
  console.log("B");
}

f();
console.log("C");

// A C B
```

```ts
setTimeout(() => console.log("X"), 0);

Promise.resolve()
  .then(() => console.log("Y"))
  .then(() => console.log("Z"));

// Y Z X
```

```js
Promise.resolve().then(() => {
  console.log("m1");
  setTimeout(() => console.log("t1"), 0);
});

setTimeout(() => console.log("t2"), 0);

Promise.resolve().then(() => {
  console.log("m2");
});

// m1 m2 t2 t1
// Here the outer code is itself a task
```

# Implement Array.prototype.myMap

```js
Array.prototype.myMap = function(callback, thisArg) {
  const arr = this;
  const result = new Array(arr.length);

  for (let i = 0; i < arr.length; i++) {
    if (i in arr) { // skip holes in sparse arrays, just like native map
      result[i] = callback.call(thisArg, arr[i], i, arr);
    }
  }

  return result;
};
```

# Write groupBy(arr, key) → group objects by property.

```ts
function groupBy<T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, obj) => {
    const k = obj[key];
    acc[k] ??= [];
    acc[k].push(obj);
    return acc;
  }, {});
}
```

# Write deepClone

```js
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  }

  return Object.entries(obj).reduce((acc, [k, v]) => {
    acc[k] = deepClone(v);
    return acc;
  }, {});
}
```

```js
// Handle circluar refs

function deepClone(obj, seen = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;

  if (seen.has(obj)) return seen.get(obj); // reuse existing clone

  const copy = Array.isArray(obj) ? [] : {};
  seen.set(obj, copy); // store before recursing

  for (const [k, v] of Object.entries(obj)) {
    copy[k] = deepClone(v, seen);
  }

  return copy;
}

const a: any = { foo: 1 };
a.self = a;

const b = deepClone(a);
console.log(b.self === b); // true, handled!
```

