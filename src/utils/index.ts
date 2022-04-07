export function extractIdByUrl(url) {
  const id = url.split("/")[5];
  const urlQueryIndex = id?.indexOf("?");
  const newId = urlQueryIndex > -1 ? id.slice(0, urlQueryIndex) : id;
  return newId;
}

export async function delay() {
  return await new Promise((resolver, _reject) => {
    setTimeout(resolver, 2000);
  });
}

export function extractStudentNameByFileName(file) {
  const index = file.name.indexOf("-");
  const studentName = file.name.slice(0, index - 1);
  return studentName;
}
