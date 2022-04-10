export function extractIdByUrl(url: string) {
  const id = url.split("/")[5];
  return id;
}

export async function delay(time: number): Promise<void> {
  return await new Promise((resolver, _reject) => {
    setTimeout(resolver, time);
  });
}

export function extractStudentNameByFileName(fileName:string) {
  const index = fileName.indexOf("-");
  const studentName = fileName.slice(0, index - 1);
  return studentName;
}
