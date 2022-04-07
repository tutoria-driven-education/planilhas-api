export function extractIdByUrl(url: string) {
  const id = url.split("/")[5];
  return id;
}

export async function delay(time: number): Promise<void> {
  return await new Promise((resolver, _reject) => {
    setTimeout(resolver, time);
  });
}

export function extractStudentNameByFileName(file: {
  name: string | string[];
}) {
  const index = file.name.indexOf("-");
  const studentName = file.name.slice(0, index - 1);
  return studentName;
}
