import { GoogleSpreadsheet } from "google-spreadsheet";
import { google } from "googleapis";
import { delay, extractStudentNameByFileName } from "../utils/index.js";
import { logger } from "../utils/logger.js";

export async function initSpreadsheet(auth, id, sheetTitle, ranges = null) {
  const doc = new GoogleSpreadsheet(id);
  doc.useOAuth2Client(auth);

  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetTitle];

    if (!sheet) return null;

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

export async function getStudents(auth, id, amountOfStudents) {
  const sheetTitle = "Dashboard";
  const initRowStudents = 12;
  const lastRowStudents = parseInt(amountOfStudents) + initRowStudents;
  const request = {
    spreadsheetId: id,
    range: `${sheetTitle}!A${initRowStudents}:B${lastRowStudents}`,
    dateTimeRenderOption: "FORMATTED_STRING",
    valueRenderOption: "UNFORMATTED_VALUE",
    auth,
  };
  const sheet = google.sheets("v4");

  try {
    const response = (await sheet.spreadsheets.values.get(request)).data;
    const studentsInfo = response.values.map((student) => ({
      name: student[0],
      email: student[1],
    }));

    return studentsInfo;
  } catch (error) {
    console.log("deu ruim em pegar os alunos", error?.message);
  }
}

export async function writeSheetStudent(
  auth,
  id,
  studentName,
  studentEmail,
  operationsFailed = []
) {
  const sheet = google.sheets("v4");
  async function changeName() {
    const values = new Array(25).fill(Array(0));
    values[15] = [studentName];
    values[21] = [studentName];
    const request = {
      spreadsheetId: id,
      range: "Controle!A1:A25",
      valueInputOption: "raw",
      auth,
      resource: {
        values,
      },
    };
    try {
      const response = (await sheet.spreadsheets.values.update(request)).data;

      return response;
    } catch (error) {
      throw new Error("Error in write name student");
    }
  }
  async function changeEmail() {
    const values = new Array(25).fill(Array(0));
    values[15] = [studentEmail];
    values[21] = [studentEmail];
    const request = {
      spreadsheetId: id,
      range: "Controle!B1:B25",
      valueInputOption: "raw",
      auth,
      resource: {
        values,
      },
    };
    try {
      const response = (await sheet.spreadsheets.values.update(request)).data;

      return response;
    } catch (error) {
      throw new Error("Error in write name student");
    }
  }

  try {
    await changeName();
    await changeEmail();
  } catch (error) {
    const operation = operationsFailed.find(
      (op) => op.id === id && op.name == "write_sheet"
    );
    if (operation !== undefined) {
      if (operation.limit >= 5) {
        logger.error(
          `Can not write sheet; error: ${error?.message} attempts:${operation.limit}`
        );
        throw new Error("Error in write sheet");
      } else {
        operation.limit += 1;
      }
    } else {
      operationsFailed.push({
        id,
        limit: 0,
        name: "write_sheet",
      });
    }
    await delay(25000);
    console.log("TRYING: Write in file again; student:", studentName);
    await writeSheetStudent(
      auth,
      id,
      studentName,
      studentEmail,
      operationsFailed
    );
  }
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

    const studentName = extractStudentNameByFileName(file);

    const nameCell = sheet.getCell(0, 1);
    nameCell.value = studentName;

    await sheet.saveUpdatedCells();

    await sheet.updateProperties({
      title,
    });

    return console.log(`Page altered on file ${file.name}`);
  } catch (err) {
    throw new Error(
      `Error when altering at new sheet on document ${file.name}`
    );
  }
}
