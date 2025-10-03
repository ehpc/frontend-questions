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

# Truthy / Falsy values

Falsy values in JS (only 6):

```js
false
0
""
null
undefined
NaN
```

# Currying & Partial Application

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return (...next) => curried(...args, ...next);
    }
  };
}
```

# Partial application

```js
function multiply(a, b, c) {
  return a * b * c;
}

const timesTen = multiply.bind(null, 10);
console.log(timesTen(2, 3)); // 60
```

# Debounce & Throttle

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

```js
function throttle(fn, limit) {
  let inThrottle = false;
  return (...args) => {
    if (inThrottle) return;
    fn.apply(this, args);
    inThrottle = true;
    setTimeout(() => inThrottle = false, limit);
  };
}
```

# Event Delegation

Event delegation = attach one listener on a parent element, and let events 
bubble up from children, instead of attaching listeners to every child individually.

👉 Why?

* Better performance (1 listener vs hundreds)
* Works with dynamically added elements (you don’t need to reattach listeners)

```js
document.querySelector('ul').addEventListener('click', e => {
  if (e.target.matches('li')) {
    console.log('Clicked', e.target.textContent);
  }
});
```

# Bubbling vs Capturing

When an event happens (e.g. click), the browser goes through three phases:

* Capturing phase (down):
  * Event travels from window → document → ... → target element (down the tree).

* Target phase:
  * The event reaches the element where it originated.

* Bubbling phase (up):
  * Event bubbles back up from target → ancestors → document → window.

```
window               window
  ↓ (capture)          ↑
document            document
  ↓                    ↑
<div>                <div>
  ↓                    ↑ (bubble)
<button>  ← target  <button>
```

```js
element.addEventListener('click', handler, true);
// true → capture phase listener

element.addEventListener('click', handler);
// default (false) → bubbling phase listener
```

# localStorage vs sessionStorage

Both are Web Storage APIs:

* Key–value storage in the browser
* Strings only (you can JSON.stringify/parse for objects)

```
| Feature             | `localStorage`           | `sessionStorage`              |
| ------------------- | ------------------------ | ----------------------------- |
| Lifetime            | Until explicitly cleared | Until tab or window is closed |
| Shared between tabs | Yes (same origin)        | No (per-tab)                  |
| Capacity            | ~5–10 MB                 | ~5 MB                         |
| Persistent          |                          | (dies with tab)               |
```

```js
localStorage.setItem('user', JSON.stringify({ name: 'Alice' }));
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.name); // Alice
```

# DOM API basics

```js
const btn = document.querySelector('#myButton');
const items = document.querySelectorAll('.item'); // NodeList

btn.addEventListener('click', () => {
  console.log('clicked!');
});

function handler() { console.log('x'); }
btn.addEventListener('click', handler);
btn.removeEventListener('click', handler);

const div = document.createElement('div');
div.textContent = 'Hello';
document.body.appendChild(div);

div.classList.add('highlight');
div.setAttribute('data-id', '123');
div.style.color = 'red';
```

# Explain difference between event.stopPropagation() and event.preventDefault().

## event.stopPropagation()

Purpose:
* Stops the event from bubbling (and/or capturing) any further up or down the DOM.

Effect:
* The event does not travel to any more ancestors.
* Listeners on the same element still fire unless you also call stopImmediatePropagation().

## event.preventDefault()

Purpose:
* Prevents the browser’s default action for that event.

Effect:
* The event still propagates, but e.g. a link won’t navigate, 
a form won’t submit, a checkbox won’t check, etc.

## event.stopImmediatePropagation()

Stops propagation and prevents any other listeners on the same element from running.

```js
btn.addEventListener('click', () => console.log('first'));
btn.addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  console.log('second & stop others');
});
btn.addEventListener('click', () => console.log('third'));
// first, second & stop others
```

# How does JS handle async under the hood?

# What are the results and why?
```js
[] + [] // ?
[] + {} // ?
{} + [] // ?
```

```js
[] + [] // ToPrimitive -> [].toString() -> "" + ""

[] + {} // ({}).toString() -> "[object Object]" -> "" + "[object Object]"

{} + [] // 0
// At the top level (not inside parentheses or an expression), {} is parsed 
// as a block, not an object literal.
// {} empty block
// +[] // unary plus applied to []
//
// [].valueOf() → []
// [].toString() → ''
// Number('') → 0

[] - [] // 0 (both become 0 with Number('')) 
// because `-` always forces numeric coercion.
```

# What is Realm

A Realm is a specification type used to define a distinct global environment, 
including a set of intrinsic objects and a global object.

In other words, a Realm is basically:

“A separate copy of the language built-ins + a separate global object.”

Every iframe, worker, vm context, or JS engine environment gets its own Realm.

```js
const iframeArray = frame.contentWindow.Array;
const arr = new iframeArray();

console.log(arr instanceof Array);        // ❌ false
console.log(Array.isArray(arr));          // ✅ true
```

