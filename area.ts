export async function delay(time: number): Promise<void> {
  return await new Promise((resolver, _reject) => {
    setTimeout(resolver, time);
  });
}
interface ITryAgainParams {
  delayTime: number;
  Fn: (params?: any) => any;
  id: string;
  maxAttempts: number;
}
interface IOperationFailed {
  id: string;
  limit: number;
  errors: Array<String>;
}
const operationsFailed: Array<IOperationFailed> = [];
export async function tryAgain({
  Fn,
  delayTime,
  id,
  maxAttempts,
}: ITryAgainParams): Promise<any> {
  try {
    return await Fn();
  } catch (error) {
    await delay(delayTime);
    const operation = operationsFailed.find((op) => op.id === id);
    if (operation != undefined) {
      if (operation.limit >= maxAttempts) {
        // logger.error(JSON.stringify(operation));
        throw new Error(`Max attempts hit! ${error?.message}`);
      } else {
        operation.limit += 1;
        operation.errors.push(error);
      }
    } else {
      operationsFailed.push({
        id,
        limit: 0,
        errors: [],
      });
    }
    return await tryAgain({ Fn, delayTime, id, maxAttempts });
  }
}

export async function returnName(name: string) {
  await delay(2000);
  return name;
}

const Fn = () => {
  returnName("batata");
};

async function run() {
  const c = await tryAgain({
    Fn,
    delayTime: 2000,
    id: "123445",
    maxAttempts: 5,
  });
  console.log(c);
}

run();
