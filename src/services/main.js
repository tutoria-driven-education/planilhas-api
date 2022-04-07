import { promiseMap } from "../lib/promiseMap.js";
import { authorize } from "./auth.js";
import {
  createFolder,
  copyFile,
  updatePermissionStudentFile,
  getIdsInsideFolder,
} from "./drive.js";
import { writeSheetStudent, getStudents } from "./sheet.js";
import sendStudentMail from "./mail.js";
import { logger } from "../utils/logger.js";
import { google } from "googleapis";
import { extractStudentNameByFileName } from "../utils/index.js";

const operationsFailed = [];

async function uploadFilesStudents(
  auth,
  students,
  folderId,
  idSpreadsheetTemplate
) {
  async function createStudentComplete(student) {
    let studentName = student.name;
    let fileNameInDrive = `${studentName} - Controle de Presença`;

    try {
      const studentId = await copyFile(
        auth,
        idSpreadsheetTemplate,
        folderId,
        fileNameInDrive,
        operationsFailed
      );
      console.log(`Copy file ${fileNameInDrive} with success!`);

      await updatePermissionStudentFile(
        auth,
        studentId,
        studentName,
        operationsFailed
      );
      console.log(`Update permission ${studentName} with success!`);

      await writeSheetStudent(
        auth,
        studentId,
        studentName,
        student.email,
        operationsFailed
      );
      console.log(`Student ${studentName} file rewritten!`);
      // await sendStudentMail(student.name, student.email, studentId);
    } catch (error) {
      logger.info(
        `Error in process of student ${studentName} error: ${error?.message}`
      );
    }
  }

  return promiseMap(students, createStudentComplete, { concurrency: 5 }); // GoogleAPI only accepts 10 queries per second (QPS), therefore, concurrency: 5 is a safe number.
}

export async function execute(
  idSpreadsheetStudents,
  idSpreadsheetTemplate,
  amountStudents,
  className,
  token
) {
  const auth = await authorize(token);
  console.log("Success on authenticate!");

  const folderId = await createFolder(auth, className);
  console.log("Creating class folder!");

  const students = await getStudents(
    auth,
    idSpreadsheetStudents,
    amountStudents
  );
  console.log("Loading students with success!");

  await uploadFilesStudents(auth, students, folderId, idSpreadsheetTemplate);
  console.log("Upload files each student");
  console.log("Done!");
}

export async function executeUpdate(
  folderId,
  idSpreadsheetTemplate,
  pageName,
  token
) {
  const auth = await authorize(token);
  console.log("Success on authenticate!");

  const sheetIdInsideTemplate = await findSheet(
    auth,
    idSpreadsheetTemplate,
    pageName
  );

  if (sheetIdInsideTemplate === null) {
    console.log("Sheet dont exist in template");
    return sheetIdInsideTemplate;
  } else {
    console.log("Success on getting sheetId!");
  }

  const {
    data: { files: arrayFilesId },
  } = await getIdsInsideFolder(auth, folderId);
  console.log("Success on getting files id!");

  await createNewPage(
    auth,
    arrayFilesId,
    idSpreadsheetTemplate,
    sheetIdInsideTemplate,
    pageName
  );
  console.log("Done!");
}

async function createNewPage(
  auth,
  arrayFilesId,
  idSpreadsheetTemplate,
  sheetIdInsideTemplate,
  pageName
) {
  async function updateStudentsFiles(file) {
    const isStudent = true;
    try {
      const studentSheetId = await findSheet(
        auth,
        file.id,
        pageName,
        isStudent
      );
      if (studentSheetId) {
        console.log(`Page ${pageName} already exists. Deleting it...`);
        await deleteSheet(auth, file, studentSheetId, pageName);
      }
      await copyToNewSheet(
        auth,
        file,
        idSpreadsheetTemplate,
        sheetIdInsideTemplate
      );
      console.log(`Copy to file ${file.name} with sucess`);

      await alterSheetNameAndInfo(auth, file, pageName);
      console.log(`Alter to file ${file.name} with sucess`);
    } catch (err) {
      throw new Error(
        `Error in process of file ${file.name} err: ${err?.message}`
      );
    }
  }

  return promiseMap(arrayFilesId, updateStudentsFiles, { concurrency: 5 }); // GoogleAPI only accepts 10 queries per second (QPS), therefore, concurrency: 5 is a safe number.
}

async function alterSheetNameAndInfo(auth, file, pageName) {
  const sheet = google.sheets("v4");
  const isStudent = true;
  const actualPageName = `Cópia de ${pageName}`;
  const studentSheetId = await findSheet(auth, file.id, pageName, isStudent);
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
                sheetId: studentSheetId
              },
            },
          },
        },
      ],
    },
    auth,
  };

  try {
    const updateName = await sheet.spreadsheets.values.update(requestValues);
    const updateTitle = await sheet.spreadsheets.batchUpdate(requestTitle);
    const updateProtect = await sheet.spreadsheets.batchUpdate(requestProtect);
    Promise.all([updateName], [updateTitle], [updateProtect]);
  } catch (err) {
    console.log(err);
    throw new Error(
      `Error when altering at new sheet on document ${file.name}`
    );
  }
}

async function copyToNewSheet(
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
    throw new Error(`Error when copying at new sheet on document ${file.name}`);
  }
}

async function deleteSheet(auth, file, studentSheetId, pageName) {
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
    throw new Error(`Failed to delete ${pageName} at file ${file.name}`);
  }
}

async function findSheet(auth, id, sheetName, isStudent = false) {
  const sheet = google.sheets("v4");

  const request = {
    spreadsheetId: id,
    auth,
  };
  if (isStudent) {
    sheetName = `Cópia de ${sheetName}`;
  }
  const sheetInsideSpread = (await sheet.spreadsheets.get(request)).data;
  let sheetTemplateId = null;
  sheetInsideSpread.sheets.forEach((sheet) => {
    if (sheet.properties.title === sheetName) {
      sheetTemplateId = sheet.properties.sheetId;
    }
  });
  return sheetTemplateId;
}
