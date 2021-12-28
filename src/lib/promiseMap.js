/**
* Provides .map-like functionality to array of Promises.
*
* @param {Array} array Array of items to "Promisify"
* @param {Function} promiseFn Function to apply to each item. Will be passed
* the item and should return a Promise.
* @param {Object} args Object of additional args to use when processing
* items. Supports concurrency property which can be used to set max number of
* items to process concurrently.
*
* @return {Promise} Returns array of individual item Promise results or error
*/
export const promiseMap = (array, promiseFn, args) => {
  if (!array) { return Promise.reject('arrayNotIterable'); }

  // This only works with arrays, sorry
  if (!array.length) { return Promise.resolve([]); }

  // Make sure we have a concurrency even if it wasn't passed explicitly
  // and that concurrency figure is somewhat realistic
  const concurrency = Math.min(
    (args || {}).concurrency || array.length,
    array.length
  );

  // Set up everything we need
  // Working list of items for queue to pull from (we don't want to modify the
  // original array)
  let workingStack = Array.from(array);

  // Array to keep track of individual Promise results with correct ordering
  let results = new Array(array.length);

  // Queue of Promises currently being processed
  let queue = [];

  // And finally, simply count how many are finished so we know when we're done
  let finished = 0;

  // Plop everything in a top-level Promise which will be returned when the
  // entire queue is processed
  return new Promise((resolve, reject) => {
    // Function to pull new item off the stack of remaining items and deal with
    // all of the bookkeeping
    function queuePromise() {
      // Pull fresh item off the working stack
      let item = workingStack.shift();

      // Promisify the item with passed promise function
      let itemPromise = (promiseFn(item) || Promise.resolve())
        .then((result) => {
          // Finished
          finished++;

          // Put result in separate result array in the same spot it started in
          results[array.indexOf(item)] = result;

          // If we've processed all items, return the top-level Promise with
          // complete results array in proper order
          if (finished === array.length) { return resolve(results); }

          // Otherwise, kill this item in the queue and process a new one if
          // there's still space
          queue.splice(queue.indexOf(itemPromise), 1);

          if (!!workingStack.length && queue.length < concurrency) {
            queuePromise();
          }
        })
        .catch((err) => {
          // In the event something goes wrong with any individual item, don't
          // attempt to move on with the other items. Maybe have an option for
          // allSettled behavior instead later?
          return reject(err);
        });

      // Queue up the new Promise we've created
      queue.push(itemPromise);

      // If we still have queue space, rack up more items
      if (!!workingStack.length && queue.length < concurrency) {
        queuePromise();
      }
    }

    // Kick off processing of passed items
    queuePromise();
  });
};
