import { Credentials } from "google-auth-library";

import { promiseMap } from "../../lib/promiseMap";
import { authorize } from "../google/auth";
import { Drive } from "../google/drive";
import { Sheet } from "../google/sheet";
import sendStudentMail from "../mail";
import { logger } from "../../utils/logger.js";
import { IStudent } from "../google/sheet.d";

interface ICreateSheetStudentsParams {
  idSpreadsheetStudents: string;
  idSpreadsheetTemplate: string;
  amountStudents: number;
  folderName: string;
  token: Credentials;
}
interface IUploadStudentsParams {
  students: IStudent[];
  folderId: string;
  idSpreadsheetTemplate: string;
  drive: Drive;
  sheet: Sheet;
}
async function uploadFilesStudents({
  students,
  folderId,
  idSpreadsheetTemplate,
  drive,
  sheet,
}: IUploadStudentsParams) {
  async function createStudentComplete(student: IStudent) {
    let studentName = student.name;
    let fileNameInDrive = `${studentName} - Controle de Presença`;

    try {
      const spreadsheetStudentId = await drive.copySpreadsheet({
        id: idSpreadsheetTemplate,
        folderId,
        nameFile: fileNameInDrive,
      });

      await drive.updatePermissionFileForAnyoneReader({
        id: spreadsheetStudentId,
      });

      await sheet.writeSheetStudent({
        id: spreadsheetStudentId,
        studentName,
        studentEmail: student.email,
      });
      // await sendStudentMail(student.name, student.email, studentId);
    } catch (error) {
      logger.info(
        `Error in process of student ${studentName} error: ${error?.message}`
      );
    }
  }

  return promiseMap({
    array: students,
    promiseFn: createStudentComplete,
    args: { concurrency: 5 },
  }); // GoogleAPI only accepts 10 queries per second (QPS), therefore, concurrency: 5 is a safe number.
}

export async function createSheetStudents({
  idSpreadsheetStudents,
  idSpreadsheetTemplate,
  amountStudents,
  folderName,
  token,
}: ICreateSheetStudentsParams) {
  const auth = await authorize(token);
  const drive = new Drive(auth);
  const sheet = new Sheet(auth);

  const folderId = await drive.createFolder({ folderName });

  const students = await sheet.getStudents({
    id: idSpreadsheetStudents,
    amountStudents,
  });

  await uploadFilesStudents({
    students,
    folderId,
    idSpreadsheetTemplate,
    drive,
    sheet,
  });
  console.log("Done!");
}
