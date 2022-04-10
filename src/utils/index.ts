import { logger } from "./logger";
export function extractIdByUrl(url: string) {
  const id = url.split("/")[5];
  return id;
}

export async function delay(time: number): Promise<void> {
  return await new Promise((resolver, _reject) => {
    setTimeout(resolver, time);
  });
}

export function extractStudentNameByFileName(fileName: string) {
  const index = fileName.indexOf("-");
  const studentName = fileName.slice(0, index - 1);
  return studentName;
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
        logger.error(`${JSON.stringify(operation)} -- time: ${new Date()}`);
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
