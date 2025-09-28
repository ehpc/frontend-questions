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