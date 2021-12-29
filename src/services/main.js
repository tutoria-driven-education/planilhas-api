import { promiseMap } from "../lib/promiseMap.js";
import { authorize } from "./auth.js";
import { uploadFile, createFolder, copyFile } from "./drive.js";
import { getStudentInfo, initSpreadsheet, writeSheetStudent } from './sheet.js'

async function getStudents(auth, id, amountOfStudents) {
  try {
    const ranges = {
      startColumnIndex: 0,
      endColumnIndex: 2,
      startRowIndex: 11,
      endRowIndex: amountOfStudents,
    }
    const sheetTitle = "Dashboard"

    const sheet = await initSpreadsheet(auth,id,sheetTitle,ranges)
    const students = getStudentInfo(sheet, amountOfStudents);
    return students
  } catch (err) {
    console.log("Error in get Students",err);
  }
}

async function uploadFilesStudents(auth,students,folderId,idSpreadsheetTemplate){
  let fileNameInDrive;
  return promiseMap(students, student => {
    fileNameInDrive = `${student.name} - Controle de Presença`
    return copyFile(auth,idSpreadsheetTemplate,folderId, fileNameInDrive).then(
      (studentId) => writeSheetStudent(auth, studentId, student.name, student.email).then(
        // TODO: add fire student email logic
        () => console.log(
          `Student ${student.name} file created!`
        )
      )
    );
    // GoogleAPI only accepts 10 queries per second (QPS), therefore, concurrency: 5 is a safe number.
  }, { concurrency: 5 });
}

async function uploadSpreadsheetStudents(auth,folderId,idSpreadsheetStudents){
  const fileNameInDrive = "template"
  const idSpreadsheet = await copyFile(auth,idSpreadsheetStudents,folderId,fileNameInDrive)

  return idSpreadsheet
}

export async function execute(idSpreadsheetStudents,idSpreadsheetTemplate,amountStudents,className,token) {
  const auth = await authorize(token);
  console.log("Success on authenticate!")

  const folderId = await createFolder(auth,className)
  console.log("Creating class folder!")

  const idTemplate = await uploadSpreadsheetStudents(auth,folderId,idSpreadsheetStudents)
  console.log("Success on copy main spread!")

  const students = await getStudents(auth,idTemplate, amountStudents)
  console.log("Loading students with success!")  

  await uploadFilesStudents(auth,students,folderId,idSpreadsheetTemplate)
  console.log("Upload files each student")
  console.log("Done!")
}


