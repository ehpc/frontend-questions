# How would you center a div (4 ways)?

```css
#container {
  height: 400px;
  background: red;
  position: relative;

  /* Flex-way
  display: flex;
  justify-content: center;
  align-items: center;
  */

  /* Grid-way
  display: grid;
  place-items: center;
  */
}

.centered {
  background-color: green;
  width: 150px;
  height: 150px;

  /* Margin way
  position: absolute;
  inset: 0; 
  margin: auto;
  */

  /* Translate way
  position: absolute;
  margin: 0 auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  */
}
```

# Two-column layout with header/footer using Flexbox

```css
html, body {
  height: 100%;
  margin: 0;
}

#main-container {
  background-color: red;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-items: stretch;
}

#middle {
  background-color: chartreuse;
  display: flex;
  flex: 1;
}

aside {
  background-color: darksalmon;
  width: 20%;
  min-width: 10rem;
  max-width: 40rem;
}

main {
  background-color: brown;
  flex: 1;
}

header {
  background-color: aqua;
}

footer {
  background-color: blueviolet;
}

```

# 3x3 grid layout

```css
html, body {
  margin: 0;
  height: 100%;
}

:root {
  --gutter: 16px;
}

.grid {
  height: 100vh;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
  gap: var(--gutter);
  padding: var(--gutter);
}

article {
  padding: var(--gutter);
  background-color: aquamarine;
  border-radius: 16px;
  display: grid;
  place-items: center;
}
```

# Sticky header

```css
.header {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

# The Specificity Table

```
(inline, IDs, classes, elements)
```

When two or more selectors target the same element, the browser compares these numbers from left to right, and the higher value wins.

```css
#menu a.item   /* (0,1,1,1) */
.nav a         /* (0,0,1,1) */
```

Basically `111 > 11`.

```css
p              /* (0,0,0,1) */
p::first-line  /* (0,0,0,2) */
```

Here `2 > 1`.

```css
p              /* 0-0-1 */

:is(p)         /* 0-0-1 */

h2:nth-last-of-type(n + 2) /* 0-1-1 */
```

# Cascade vs inheritance

Cascade is how CSS resolves conflicts between multiple rules. 
Inheritance is how certain properties automatically pass from parent 
to child. Cascade is about which wins, inheritance is about what 
gets passed down.

Order of importance:
* Origin: User agent styles < User styles < Author styles < !important
* Specificity: (inline, IDs, classes, elements)
* Source order: last one wins if specificity is equal

Some CSS properties are passed down from parent to child automatically.
Inheritable properties: color, font-family, line-height, visibility, etc.
Non-inheritable properties: margin, padding, border, background, etc.

# Create mobile-first layout

Desktop: sidebar + main content.
Mobile: stack them vertically.

```css
html, body {
  height: 100%;
  margin: 0;
}

.container {
  display: grid;
  grid-template-areas:
    "head"
    "side"
    "main"
    "foot";
  grid-template-rows: auto auto 1fr auto;
  min-height: 100vh;
  min-height: 100dvh;
}

@media (min-width: 500px) {
  .container {
    grid: 
      "head head" auto
      "side main" 1fr
      "foot foot" auto
      / minmax(150px, 20vw) 1fr;
  }
}

header {
  grid-area: head;
  background-color: aquamarine;
}

aside {
  grid-area: side;
  background-color: brown;
}

main {
  grid-area: main;
  background-color: cadetblue;
}

footer {
  grid-area: foot;
  background-color: blueviolet;
}
```

