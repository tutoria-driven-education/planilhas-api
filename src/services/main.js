import { promiseMap } from "../lib/promiseMap.js";
import { authorize } from "./auth.js";
import {
  createFolder,
  copyFile,
  updatePermissionStudentFile,
  getIdsInsideFolder,
} from "./drive.js";
import {
  getStudentInfo,
  initSpreadsheet,
  writeSheetStudent,
  copyToNewSheet,
  alterSheetNameAndInfo,
} from "./sheet.js";
import sendStudentMail from "./mail.js";
import { logger } from "../utils/logger.js";

const operationsFailed = [];

async function getStudents(auth, id, amountOfStudents) {
  const amountStudentsRange = parseInt(amountOfStudents) + 11; //initial row students
  try {
    const ranges = {
      startColumnIndex: 0,
      endColumnIndex: 2,
      startRowIndex: 11,
      endRowIndex: amountStudentsRange,
    };
    const sheetTitle = "Dashboard";
    const sheet = await initSpreadsheet(auth, id, sheetTitle, ranges);
    const students = getStudentInfo(sheet, amountStudentsRange);
    return students;
  } catch (err) {
    console.log("Error in get Students: ", err?.message);
  }
}

async function uploadSpreadsheetStudents(
  auth,
  folderId,
  idSpreadsheetStudents
) {
  const fileNameInDrive = "template";
  const idSpreadsheet = await copyFile(
    auth,
    idSpreadsheetStudents,
    folderId,
    fileNameInDrive
  );

  return idSpreadsheet;
}

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
      logger.error(
        `Error in process of student ${studentName} error: ${error?.message}`
      );
      // console.log("Erro no processo geral")
    }
  }

  return promiseMap(students, createStudentComplete, { concurrency: 10 }); // GoogleAPI only accepts 10 queries per second (QPS), therefore, concurrency: 5 is a safe number.
}

async function createNewPage(auth, arrayFilesId, templateSheet, pageName) {
  async function updateStudentsFiles(file) {
    try {
      await copyToNewSheet(file, templateSheet);
      await alterSheetNameAndInfo(auth, file, pageName);
    } catch (err) {
      throw new Error(`Error in process of file ${file.name}`, err?.message);
    }
  }

  return promiseMap(arrayFilesId, updateStudentsFiles, { concurrency: 5 }); // GoogleAPI only accepts 10 queries per second (QPS), therefore, concurrency: 5 is a safe number.
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

  const idTemplate = await uploadSpreadsheetStudents(
    auth,
    folderId,
    idSpreadsheetStudents
  );
  console.log("Success on copy main spread!");
  const students = await getStudents(auth, idTemplate, amountStudents);
  console.log("Loading students with success!");

  await uploadFilesStudents(auth, students, folderId, idSpreadsheetTemplate);
  console.log("Upload files each student");
  console.log("Done!");
}

export async function executeUpdate(folderId, idSpreadsheet, pageName, token) {
  const auth = await authorize(token);
  console.log("Success on authenticate!");

  const templateSheet = await initSpreadsheet(auth, idSpreadsheet, pageName);
  console.log("Success on loading page!");

  const {
    data: { files: arrayFiles },
  } = await getIdsInsideFolder(auth, folderId);
  console.log("Success on getting files id!");

  await createNewPage(auth, arrayFiles, templateSheet, pageName);
  console.log("Done!");
}
