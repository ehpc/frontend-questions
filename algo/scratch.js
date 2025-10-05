// Scratchpad

//`[2, 1, 2, 4, 3] → next greater = [4, 2, 4, -1, -1]`
function nextgreater(arr) {
  const greatests = [];
  const results = Array(arr.length).fill(-1);
  for (let i = arr.length - 1; i >= 0; i--) {
    if (greatests.length) {
      while (greatests[greatests.length - 1] <= arr[i]) {
        greatests.pop();
      }
      if (greatests.length) {
        results[i] = greatests[greatests.length - 1];
      }
    }
    greatests.push(arr[i]);
  }
  return results;
}

console.log(nextgreater([2, 1, 2, 4, 3])) //[4, 2, 4, -1, -1]
console.log(nextgreater([2, 6, 2, 4, 3])) //[6, -1, 4, -1, -1]
console.log(nextgreater([2, 1, 4, 3])); //  [4, 4, -1, -1]


