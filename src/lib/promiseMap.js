const promiseMap = (array, promiseFn, args) => {
	if (!array) { return Promise.reject('arrayNotIterable'); }

	if (!array.length) { return Promise.resolve([]); }
	const concurrency = Math.min(
		(args || {}).concurrency || array.length,
		array.length,
	);

	const workingStack = Array.from(array);

	const results = new Array(array.length);

	const queue = [];
	let finished = 0;

	return new Promise((resolve, reject) => {
		function queuePromise() {
			const item = workingStack.shift();
			const itemPromise = (promiseFn(item) || Promise.resolve())
				.then((result) => {
					finished++;
					results[array.indexOf(item)] = result;
					if (finished === array.length) { return resolve(results); }

					queue.splice(queue.indexOf(itemPromise), 1);

					if (!!workingStack.length && queue.length < concurrency) {
						queuePromise();
					}
				})
				.catch((err) => reject(err));

			queue.push(itemPromise);

			if (!!workingStack.length && queue.length < concurrency) {
				queuePromise();
			}
		}
		queuePromise();
	});
};

export default promiseMap;
