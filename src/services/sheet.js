import { GoogleSpreadsheet } from "google-spreadsheet";
import { delay } from "../utils/index.js";
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

export async function writeSheetStudent(
  auth,
  id,
  studentName,
  studentEmail,
  operationsFailed = []
) {
  const sheetTitle = "Controle";
  const ranges = {
    startColumnIndex: 0,
    endColumnIndex: 4,
    startRowIndex: 0,
    endRowIndex: 20,
  };
  try {
    const sheet = await initSpreadsheet(auth, id, sheetTitle, ranges);

    const nomeCell = sheet.getCell(15, 0);
    nomeCell.value = studentName;
    const emailCell = sheet.getCell(15, 1);
    emailCell.value = studentEmail;

    return await sheet.saveUpdatedCells();
  } catch (error) {
    const operation = operationsFailed.find(
      (op) => op.id === id && op.name == "write_sheet"
    );
    if (operation !== undefined) {
      if (operation.limit >= 5) {
        logger.error(
          `Can not write file  ${studentName} error: ${error?.message} attempts:${operation.limit}`
        );
        throw new Error("Não foi possivel escrever no arquivo", studentName);
      } else {
        operation.limit += 1;
      }
    } else {
      operationsFailed.push({
        id,
        name: "write_sheet",
        limit: 0,
        data: {
          studentName,
          studentEmail,
        },
      });
    }
    // eslint-disable-next-line no-console
    console.log(`TRYING: Tentando escrever novamente o arquivo ${studentName}`);
    await delay(5000);
    await writeSheetStudent(
      auth,
      id,
      studentName,
      studentEmail,
      operationsFailed
    );
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
    const index = file.name.indexOf("-");
    const studentName = file.name.slice(0, index - 1);

    const nameCell = sheet.getCell(0, 1);
    nameCell.value = studentName;

    await sheet.updateProperties({
      title,
    });
    await sheet.saveUpdatedCells();
    // eslint-disable-next-line no-console
    console.log(`Page altered on file ${file.name}`);
    return;
  } catch (err) {
    throw new Error(
      `Error when altering at new sheet on document ${file.name}`
    );
  }
}
