export function extractIdByUrl(url) {
  const id = url.split("/")[5];
  const urlQueryIndex = id?.indexOf("?");
  const newId = urlQueryIndex > -1 ? id.slice(0, urlQueryIndex) : id;
  return newId;
}

export async function delay(time) {
  return await new Promise((resolver, _reject) => {
    setTimeout(resolver, time);
  });
}

export function extractStudentNameByFileName(file) {
  const index = file.name.indexOf("-");
  const studentName = file.name.slice(0, index - 1);
  return studentName;
}

export function getCurrentSpreadLetter(week) {
  const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ"];
  return alphabet[parseInt(week)+2];
}
