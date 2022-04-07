interface IPromiseMapParams {
  array: Array<any>;
  promiseFn: (item: any) => Promise<void>;
  args?: {
    concurrency?: number;
  };
}

export function promiseMap({ array, promiseFn, args }: IPromiseMapParams) {
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

  let queue: Array<Promise<void>> = [];
  let finished = 0;

  return new Promise((resolve, reject) => {
    function queuePromise() {
      let item = workingStack.shift();
      let itemPromise = (promiseFn(item) || Promise.resolve())
        .then((result) => {
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
        .catch((err) => {
          return reject(err);
        });

      queue.push(itemPromise);

      if (!!workingStack.length && queue.length < concurrency) {
        queuePromise();
      }
    }
    queuePromise();
  });
}
