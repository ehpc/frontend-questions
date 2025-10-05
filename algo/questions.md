# Convert a brute force “find pairs that sum to target” solution into a hash-based one.

```js
function twoSumBrute(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === target) return [i, j];
    }
  }
  return null;
}
```

```js
function twoSumHash(arr, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < arr.length; i++) {
    const need = target - arr[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(arr[i], i);
  }
  return null;
}
```

# Reverse a string without using .reverse().

```js
function reverseString(str) {
  const res = [];
  for (let i = str.length - 1; i >= 0; i--) {
    res.push(str[i]);
  }
  return res.join('');
}
```

```js
function reverseString(str) {
  const arr = str.split("");
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]]; // swap
    left++;
    right--;
  }

  return arr.join("");
}
```

# Remove duplicates from sorted array (in place).

```js
function removeDuplicates(nums) {
  if (nums.length === 0) return [];

  let left = 1;
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[read - 1]) {
      nums[left] = nums[read];
      left++;
    }
  }

  nums.length = left;
  return nums;
}
```

# Longest substring without repeating characters.

```js
function longestSubstringNoRepeats(str) {
  const last = new Map();
  let left = 0
  let bestLen = 0
  let bestStart = 0;

  for (let right = 0; right < str.length; right++) {
    const ch = str[right];
    if (last.has(ch) && last.get(ch) >= left) {
      left = last.get(ch) + 1;
    }
    last.set(ch, right);

    const len = right - left + 1;
    if (len > bestLen) {
      bestLen = len;
      bestStart = left;
    }
  }
  return str.slice(bestStart, bestStart + bestLen);
}
```

# Max sum of subarray of length k.

```js
function maxSumFixedWindow(nums, k) {
  if (k <= 0 || k > nums.length) return null;
  let sum = 0;

  // initial window
  for (let i = 0; i < k; i++) sum += nums[i];
  let best = sum;

  // slide
  for (let i = k; i < nums.length; i++) {
    sum += nums[i] - nums[i - k];
    if (sum > best) best = sum;
  }
  return best;
}
```

# First non-repeating character in a string.

```js
function firstchar(str) {
  const freq = new Map();
  for (const ch of str) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  for (const ch of str) {
    if (freq.get(ch) === 1) return ch;
  }
  return null;
}
```

# Group by: given an array of objects, group by a key.

```js
function groupBy(arr, key) {
  const result = {};
  for (const item of arr) {
    const groupVal = item[key];
    if (!result[groupVal]) {
      result[groupVal] = [];
    }
    result[groupVal].push(item);
  }
  return result;
}
```

# Flatten an array

```js
function flatten(arr) {
  const result = [];
  for (const el of arr) {
    if (Array.isArray(el)) {
      result.push(...flatten(el));
    } else {
      result.push(el);
    }
  }
  return result;
}
```

# Factorial

```js
function factorialTail(n, acc = 1) {
  if (n === 0) return acc;
  return factorialTail(n - 1, n * acc);
}
```

# Fibonacci recursively → then optimize with memoization.

```js
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(6)); // 8
```

```js
function fibMemo(n, cache = {}) {
  if (n in cache) return cache[n];
  if (n <= 1) return n;

  cache[n] = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  return cache[n];
}

console.log(fibMemo(40)); // fast!
```

# Write recursive deepClone.

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
// Handle circular refs
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
```

# Bubble sort

```js
function bubbleSortOptimized(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // already sorted
  }
  return arr;
}
```

# Selection sort

```js
function selectionSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }

  return arr;
}

```

# Validate parentheses

```js
function isValidParentheses(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };

  for (const ch of s) {
    if (ch in pairs) {
      const top = stack.pop();
      if (top !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }

  return stack.length === 0;
}
```

# Next greater element (monotonic stacks)
For each element nums[i], find the first element to the right that is strictly greater.

`[2, 1, 2, 4, 3] → next greater = [4, 2, 4, -1, -1]`

```js
function nextGreater(nums) {
  const n = nums.length;
  const res = new Array(n).fill(-1);
  const st = []; // stack of candidates (values)

  for (let i = n - 1; i >= 0; i--) {
    const x = nums[i];
    while (st.length && st[st.length - 1] <= x) st.pop();
    if (st.length) res[i] = st[st.length - 1];
    st.push(x);
  }
  return res;
}
```
