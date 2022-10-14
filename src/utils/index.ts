import { SchemasFile } from "types";

export function extractIdByUrl(url: string): string {
  const id = url.split("/")[5];
  const urlQueryIndex = id.indexOf("?");
  const newId = urlQueryIndex > -1 ? id.slice(0, urlQueryIndex) : id;
  return newId;
}

export async function delay(time: number): Promise<void> {
  await new Promise((resolver, _reject) => {
    setTimeout(resolver, time);
  });
}

export function extractStudentNameByFileName(file: SchemasFile | undefined): string {
  const index = file.name.indexOf("-");
  const studentName = file.name.slice(0, index - 1);
  return studentName;
}
