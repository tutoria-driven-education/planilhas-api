import { promiseMap } from "../lib/promiseMap.js";
import { authorize } from "./auth.js";
import {
  createFolder,
  copyFile,
  updatePermissionStudentFile,
  getIdsInsideFolder,
} from "./drive.js";
import {
  writeSheetStudent,
  getStudents,
  findSheet,
  deleteSheet,
  copyToNewSheet,
  alterSheetNameAndInfo,
  getStudentsInfoWithAttendancePercentage,
  initSpreadsheet,
  getStudentControlData,
  alterControlSheet,
  writeCareerSheetStudent,
  getStudentsWithFlags,
  getStudentsSituation,
  writeFlag,
} from "./sheet.js";
import sendStudentMail from "./mail.js";
import { logger } from "../utils/logger.js";
import NodeMailer from "nodemailer";
import { extractStudentNameByFileName } from "../utils/index.js";

const operationsFailed = [];

const mail = NodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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
      sendStudentMail(mail, student.name, student.email, studentId);
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
  isProtected,
  isHidden,
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
    isProtected,
    isHidden,
    pageName
  );
  console.log("Done!");
}

export async function getStudentsUnderNinetyPercent(
  idSpreadsheet,
  token,
  endpoint
) {
  const auth = await authorize(token);
  console.info("Success on authenticate!");

  const amountStudentsRange = parseInt(endpoint) + 11;
  const ranges = {
    startColumnIndex: 0,
    endColumnIndex: 6,
    startRowIndex: 11,
    endRowIndex: amountStudentsRange,
  };

  const sheetTitle = "Dashboard";
  const sheet = await initSpreadsheet(auth, idSpreadsheet, sheetTitle, ranges);

  const studentsInfo = await getStudentsInfoWithAttendancePercentage(
    sheet,
    endpoint
  );
  console.info("Loading students with success!");

  return studentsInfo;
}

async function createNewPage(
  auth,
  arrayFilesId,
  idSpreadsheetTemplate,
  sheetIdInsideTemplate,
  isProtected,
  isHidden,
  pageName
) {
  async function updateStudentsFiles(file) {
    try {
      const studentSheetId = await findSheet(auth, file.id, pageName);
      if (studentSheetId) {
        console.log(
          `Page ${pageName} already exists at ${file.name}. Deleting it...`
        );
        await deleteSheet(auth, file, studentSheetId, pageName);
      }

      console.log(`Starting copy to file ${file.name}...`);
      await copyToNewSheet(
        auth,
        file,
        idSpreadsheetTemplate,
        sheetIdInsideTemplate
      );
      console.log(`Copy to file ${file.name} with success`);

      await alterSheetNameAndInfo(auth, file, pageName, isProtected, isHidden);
      console.log(`Alter to file ${file.name} with success`);
    } catch (err) {
      throw new Error(
        `Error in process of file ${file.name} err: ${err?.message}`
      );
    }
  }

  return promiseMap(arrayFilesId, updateStudentsFiles, { concurrency: 5 });
}

export async function executeUpdateControl(
  folderId,
  idSpreadsheetTemplate,
  pageName,
  isProtected,
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

  await createNewControlPage(
    auth,
    arrayFilesId,
    idSpreadsheetTemplate,
    sheetIdInsideTemplate,
    isProtected,
    pageName
  );
  console.log("Done!");
}

async function createNewControlPage(
  auth,
  arrayFilesId,
  idSpreadsheetTemplate,
  sheetIdInsideTemplate,
  isProtected,
  pageName
) {
  async function updateStudentsControl(file) {
    try {
      const studentSheetId = await findSheet(auth, file.id, pageName);
      let studentData = null;
      if (studentSheetId || studentSheetId === 0) {
        studentData = await getStudentControlData(
          auth,
          file,
          studentSheetId,
          pageName
        );
        console.log(`Getting student data at ${file.name}...`);
        await deleteSheet(auth, file, studentSheetId, pageName);
        console.log(
          `Page ${pageName} already exists at ${file.name}. Deleting it...`
        );
      }
      if (studentData === null) {
        throw new Error(
          `Problem processing student data at file: ${file.name}`
        );
      }
      console.log(`Starting copy to file ${file.name}...`);
      await copyToNewSheet(
        auth,
        file,
        idSpreadsheetTemplate,
        sheetIdInsideTemplate
      );
      console.log(`Copy to file ${file.name} with success`);

      await alterControlSheet(auth, file, pageName, isProtected, studentData);
    } catch (err) {
      throw new Error(
        `Error in process of file ${file.name} err: ${err?.message}`
      );
    }
  }

  return promiseMap(arrayFilesId, updateStudentsControl, { concurrency: 5 });
}

export async function executeCarrer(
  folderIdWithStudents,
  idSpreadsheetTemplate,
  pageName,
  folderName,
  token
) {
  const auth = await authorize(token);
  console.log("Success on authenticate!");

  const createdFolderId = await createFolder(auth, folderName);
  console.log("Creating class folder!");

  const {
    data: { files: arrayFilesId },
  } = await getIdsInsideFolder(auth, folderIdWithStudents);
  console.log("Success on getting files id!");

  await createNewCareerPage(
    auth,
    arrayFilesId,
    idSpreadsheetTemplate,
    pageName,
    createdFolderId
  );

  console.log("Done!");
}

async function createNewCareerPage(
  auth,
  arrayFilesId,
  idSpreadsheetTemplate,
  pageName,
  createdFolderId
) {
  async function createCareerPage(file) {
    const studentName = extractStudentNameByFileName(file);
    const fileNameInDrive = `${studentName} - Applications`;

    try {
      const studentId = await copyFile(
        auth,
        idSpreadsheetTemplate,
        createdFolderId,
        fileNameInDrive,
        operationsFailed
      );
      console.log(`Copy file ${fileNameInDrive} with success!`);

      await writeCareerSheetStudent(
        auth,
        studentId,
        studentName,
        pageName,
        fileNameInDrive
      );
      console.log(`Student ${studentName} file rewritten!`);
    } catch (error) {
      logger.info(
        `Error in process of student ${studentName} error: ${error?.message}`
      );
    }
  }

  return promiseMap(arrayFilesId, createCareerPage, { concurrency: 5 });
}

export async function executeUpdateFlags({
  idSpreadsheetStudents,
  idSpreadsheetUpdate,
  start,
  end,
  week,
  token
}) {
  const auth = await authorize(token);
  console.log("Success on authenticate!");

  const studentsFlags = await getStudentsWithFlags(auth, idSpreadsheetUpdate);
  console.log("Success on getting student flags!");

  const studentNeedingFlags = await getStudentsSituation(auth, idSpreadsheetStudents, start, end, week);
  console.log("Success on getting student situation!");

  const CORRECTION = 2;
  const lastStudentRow = parseInt(studentsFlags.length) + CORRECTION;

  await updateFlags(auth, studentNeedingFlags, week, idSpreadsheetUpdate, lastStudentRow);
  console.log("Done!");
}

async function updateFlags(auth, studentNeedingFlags, week, idSpreadsheetUpdate, lastStudentRow) {
  const requestArray = [];
  for (let i = 0; i < studentNeedingFlags.length; i++) {
    const student = studentNeedingFlags[i];
    const currentArray = [];
    currentArray.push(student.name, "", student.currentFlag, week, false, false, false, "");
    requestArray.push(currentArray);
  }
  await writeFlag(auth, requestArray, idSpreadsheetUpdate, lastStudentRow);
}
