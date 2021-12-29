import {
GoogleSpreadsheet
} from 'google-spreadsheet'

export async function initSpreadsheet(auth,id,sheetTitle,ranges){  
  const doc = new GoogleSpreadsheet(id)
  
  doc.useOAuth2Client(auth)

  await doc.loadInfo()
  const sheet = doc.sheetsByTitle[sheetTitle]
 
  await sheet.loadCells(ranges)
  
  return sheet

}

export async function writeSheetStudent(auth,id,studentName,studentEmail) {
  const sheetTitle = "Controle"
  const ranges = {
    startColumnIndex: 0,
    endColumnIndex: 4,
    startRowIndex: 0,
    endRowIndex: 20,
  }
  const sheet = await initSpreadsheet(auth,id,sheetTitle, ranges)

  const nomeCell = sheet.getCell(15,0)
  nomeCell.value = studentName
  const emailCell = sheet.getCell(15,1)
  emailCell.value = studentEmail

  await sheet.saveUpdatedCells();
}

export function getStudentInfo(sheet, amountOfStudents) {
  const students = [];
  const initialRowStudents = 11
  for (let i = initialRowStudents; i < amountOfStudents; i++) {
    const name = sheet.getCell(i, 0).value;
    const email = sheet.getCell(i, 1).value;
    if (name === null) break;
    students.push({ name, email });
  }
  return students;
}