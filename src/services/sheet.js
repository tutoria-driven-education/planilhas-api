import { google } from "googleapis";
import { delay, extractStudentNameByFileName } from "../utils/index.js";
import { logger } from "../utils/logger.js";

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
    const studentsInfo = [];
    const response = (await sheet.spreadsheets.values.get(request)).data.values;
    for (const student of response) {
      if (student[0] == undefined) {
        break;
      }
      studentsInfo.push({
        name: student[0],
        email: student[1],
      });
    }

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

export async function findSheet(auth, id, sheetName) {
  const sheet = google.sheets("v4");

  const request = {
    spreadsheetId: id,
    auth,
  };
  try {
    const sheetInsideSpread = (await sheet.spreadsheets.get(request)).data;
    let sheetTemplateId = null;
    sheetInsideSpread.sheets.forEach((sheet) => {
      if (sheet.properties.title === sheetName) {
        sheetTemplateId = sheet.properties.sheetId;
      }
    });
    return sheetTemplateId;
  } catch (err) {
    console.log(err?.message);
    console.log(`Failed to find ${sheetName}, trying again!`);
    await delay(5000);
    return await findSheet(auth, id, sheetName);
  }
}

export async function deleteSheet(auth, file, studentSheetId, pageName) {
  const sheet = google.sheets("v4");

  const request = {
    spreadsheetId: file.id,
    resource: {
      requests: [
        {
          deleteSheet: {
            sheetId: studentSheetId,
          },
        },
      ],
    },
    auth,
  };

  try {
    await sheet.spreadsheets.batchUpdate(request);
    console.log(`Sucess on delete ${pageName} at file ${file.name}`);
  } catch (err) {
    console.log(err?.message);
    await delay(5000);
    await deleteSheet(auth, file, studentSheetId, pageName);
    console.log(
      `Failed to delete ${pageName} at file ${file.name}, trying again!`
    );
  }
}

export async function copyToNewSheet(
  auth,
  file,
  idSpreadsheetTemplate,
  sheetIdInsideTemplate
) {
  const sheet = google.sheets("v4");

  const request = {
    spreadsheetId: idSpreadsheetTemplate,
    sheetId: sheetIdInsideTemplate,
    resource: {
      destinationSpreadsheetId: file.id,
    },
    auth,
  };
  try {
    await sheet.spreadsheets.sheets.copyTo(request);
  } catch (err) {
    console.log(err?.message);
    await delay(5000);
    await copyToNewSheet(
      auth,
      file,
      idSpreadsheetTemplate,
      sheetIdInsideTemplate
    );
    console.log(`Error when copying at new sheet on document ${file.name}`);
  }
}

export async function alterSheetNameAndInfo(
  auth,
  file,
  pageName,
  operationsFailed = []
) {
  const sheet = google.sheets("v4");
  const actualPageName = `Cópia de ${pageName}`;
  const studentSheetId = await findSheet(auth, file.id, actualPageName);
  const studentName = extractStudentNameByFileName(file);

  const values = new Array(4).fill(Array(0));
  values[0] = [studentName];

  const requestValues = {
    spreadsheetId: file.id,
    range: `${actualPageName}!B1:B6`,
    valueInputOption: "raw",
    auth,
    resource: {
      values,
    },
  };

  const requestTitle = {
    spreadsheetId: file.id,
    resource: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: studentSheetId,
              title: pageName,
              hidden: true,
            },
            fields: "title, hidden",
          },
        },
      ],
    },
    auth,
  };

  const requestProtect = {
    spreadsheetId: file.id,
    resource: {
      requests: [
        {
          addProtectedRange: {
            protectedRange: {
              range: {
                sheetId: studentSheetId,
              },
            },
          },
        },
      ],
    },
    auth,
  };

  try {
    await sheet.spreadsheets.values.update(requestValues);
    const updateTitle = sheet.spreadsheets.batchUpdate(requestTitle);
    const updateProtect = sheet.spreadsheets.batchUpdate(requestProtect);
    await Promise.all([updateTitle, updateProtect]);
  } catch (err) {
    console.log(`Leleo alter => ${err?.message}`);
    const operation = operationsFailed.find(
      (op) => op.id === studentSheetId && op.name == "alter_sheet"
    );
    if (operation !== undefined) {
      if (operation.limit >= 5) {
        logger.error(
          `Can not alter sheet; error: ${err?.message} attempts:${operation.limit}`
        );
        throw new Error("Error in alter sheet");
      } else {
        operation.limit += 1;
      }
    } else {
      operationsFailed.push({
        id: studentSheetId,
        limit: 0,
        name: "alter_sheet",
      });
    }
    await delay(25000);
    console.log(`TRYING: alter in file again; student: ${studentName} `);
    await alterSheetNameAndInfo(auth, file, pageName, operationsFailed);
  }
}
