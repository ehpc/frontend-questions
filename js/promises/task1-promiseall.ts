function promiseAll<T>(promises: Array<T | PromiseLike<T>>): Promise<T[]> {
  const len = promises.length;
  const values: T[] = new Array(len);
  let completedCount = 0;
  return new Promise<T[]>((resolve, reject) => {
    if (!len) {
      return resolve([]);
    }
    for (let i = 0; i < len; i++) { // Don't use forEach because it skips items in sparse arrays
      Promise.resolve(promises[i]).then(
        (value) => {
          values[i] = value;
          completedCount += 1;
          if (completedCount === len) {
            resolve(values);
          }
        },
        reject
      );
    }
  });
}

const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 500));
const resolvedPromise = Promise.resolve(42);
const staticValue = 128;
const rejectedPromise = Promise.reject('error');

promiseAll([timeoutPromise, resolvedPromise, staticValue]).then((values) => {
  console.log(values); // ['timeout', 42, 128]
}).catch((reason) => {
  console.error(reason);
});

promiseAll([timeoutPromise, resolvedPromise, rejectedPromise]).then((values) => {
  console.log(values);
}).catch((reason) => {
  console.error(reason); // 'error'
});


export {};