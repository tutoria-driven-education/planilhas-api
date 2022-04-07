import { promiseMap } from "../lib/promiseMap";
import { authorize } from "./auth";
import {
  createFolder,
  copyFile,
  updatePermissionStudentFile,
  getIdsInsideFolder,
} from "./drive";
import {
  initSpreadsheet,
  writeSheetStudent,
  copyToNewSheet,
  alterSheetNameAndInfo,
  getStudents
} from "./sheet.js";
import sendStudentMail from "./mail.js";
import { logger } from "../utils/logger.js";

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

async function createNewPage(auth, arrayFilesId, templateSheet, pageName) {
  async function updateStudentsFiles(file) {
    try {

      const page = await initSpreadsheet(auth, file.id, pageName );

      if(page) {
        console.log(`Page ${pageName} already exists. Deleting it...`);
        await page.delete()
      }
            
      await copyToNewSheet(file, templateSheet);
      console.log(`Copy to file ${file.name} with sucess`);

      await alterSheetNameAndInfo(auth, file, pageName);
      console.log(`Alter to file ${file.name} with sucess`);
    } catch (err) {
      throw new Error(`Error in process of file ${file.name} err: ${err?.message}`);
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

  const students = await getStudents(auth, idSpreadsheetStudents, amountStudents);
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
