import { GoogleSpreadsheet } from "google-spreadsheet";
import { google } from 'googleapis'
import { delay, extractStudentNameByFileName } from "../utils/index.js";
import { logger } from "../utils/logger.js";

export async function initSpreadsheet(auth, id, sheetTitle, ranges = null) {
  const doc = new GoogleSpreadsheet(id);

  doc.useOAuth2Client(auth);

  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetTitle];

    if (ranges) {
      await sheet.loadCells(ranges);
    } else {
      await sheet.loadCells();
    }

    return sheet;
  } catch (err) {
    throw new Error("Error in init spreadsheet");
  }
}


export async function writeSheetStudent(auth,
  id,
  studentName,
  studentEmail,
  operationsFailed = []) {
  const sheet = google.sheets('v4')
  async function changeName() {
    const values = new Array(25).fill(Array(0))
    values[15] = [studentName]
    values[21] = [studentName]
    const request = {
      spreadsheetId: id,
      range: 'Controle!A1:A25',
      valueInputOption: 'raw',
      auth,
      resource: {
        values
      }
    }
    try {
      const response = (await sheet.spreadsheets.values.update(request)).data

      return response

    } catch (error) {
      console.log("Error in changed Name", error?.message)
    }
  }
  async function changeEmail() {
    const values = new Array(25).fill(Array(0))
    values[15] = [studentEmail]
    values[21] = [studentEmail]
    const request = {
      spreadsheetId: id,
      range: 'Controle!B1:B25',
      valueInputOption: 'raw',
      auth,
      resource: {
        values
      }
    }
    try {
      const response = (await sheet.spreadsheets.values.update(request)).data

      return response

    } catch (error) {
      console.log("Error in change email", error?.message)
    }
  }

  try {
    await changeName();
    await changeEmail();
    // await Promise.all([changeEmail, changeName])
  } catch (error) {

  }
}
export function getStudentInfo(sheet, amountOfStudents) {
  const students = [];
  const initialRowStudents = 11;
  for (let i = initialRowStudents; i < amountOfStudents; i++) {
    const name = sheet.getCell(i, 0).value;
    const email = sheet.getCell(i, 1).value;
    if (name === null) break;
    students.push({ name, email });
  }
  return students;
}

export async function copyToNewSheet(file, templateSheet) {
  try {
    await templateSheet.copyToSpreadsheet(file.id);
  } catch (err) {
    throw new Error(
      `Error when inserting at new sheet on document ${file.name}`
    );
  }
}

export async function alterSheetNameAndInfo(auth, file, title) {
  try {
    const copyTitle = `Cópia de ${title}`;
    const sheet = await initSpreadsheet(auth, file.id, copyTitle);
    const studentName = extractStudentNameByFileName(file.name);

    const nameCell = sheet.getCell(0, 1);
    nameCell.value = studentName;

    const updatePropertiesPromise = sheet.updateProperties({
      title,
    });
    const saveSheetCellsPromise = sheet.saveUpdatedCells();

    await Promise.all([updatePropertiesPromise, saveSheetCellsPromise]);
    console.log(`Page altered on file ${file.name}`);
    return;
  } catch (err) {
    throw new Error(
      `Error when altering at new sheet on document ${file.name}`
    );
  }
}
