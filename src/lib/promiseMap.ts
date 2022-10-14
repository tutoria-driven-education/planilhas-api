import { Args, SchemasFile } from "types";

export function promiseMap (array: SchemasFile[], promiseFn: Function, args: Args) {
  if (!array) {
    return Promise.reject("arrayNotIterable");
  }

  if (!array.length) {
    return Promise.resolve([]);
  }
  const concurrency = Math.min(
    (args || {}).concurrency || array.length,
    array.length
  );

  let workingStack = Array.from(array);

  let results = new Array(array.length);

  let queue: any[] = [];
  let finished: number = 0;

  return new Promise((resolve, reject) => {
    function queuePromise() {
      let item = workingStack.shift();
      let itemPromise = (promiseFn(item) || Promise.resolve())
        .then((result: any) => {
          finished++;
          results[array.indexOf(item)] = result;
          if (finished === array.length) {
            return resolve(results);
          }

          queue.splice(queue.indexOf(itemPromise), 1);

          if (!!workingStack.length && queue.length < concurrency) {
            queuePromise();
          }
        })
        .catch((err: Error) => {
          return reject(err);
        });

      queue.push(itemPromise);

      if (!!workingStack.length && queue.length < concurrency) {
        queuePromise();
      }
    }
    queuePromise();
  });
};
