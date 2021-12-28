import { authorize } from "./auth.js";
import { uploadFile, createFolder } from "./drive.js";
import { getStudentInfo, initSpreadsheet, writeSheetStudent } from './sheet.js'
import { promiseMap } from "./lib/promiseMap.js"

async function getStudents(auth, id) {
  try {
    const ranges = {
      startColumnIndex: 0,
      endColumnIndex: 2,
      startRowIndex: 11,
      endRowIndex: 125,
    }
    const sheetTitle = "Dashboard"
    const amountOfStudents = 130

    const sheet = await initSpreadsheet(auth, id, sheetTitle, ranges)
    const students = getStudentInfo(sheet, amountOfStudents);
    return students
  } catch (err) {
    console.log("Request fail, try again");
  }
}

async function uploadFilesStudents(auth, students, folderId) {
  const pathTemplateStudent = 'templateAluno.xlsx'
  let fileNameInDrive;

  return promiseMap(students, student => {
    fileNameInDrive = `${student.name} - Controle de Presença`
    return uploadFile(auth, fileNameInDrive, pathTemplateStudent, folderId).then(
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

async function uploadSpreadsheetStudents(auth, folderId) {
  const fileNameInDrive = "template"
  const path = "template.xlsx"
  const idSpreadsheet = await uploadFile(auth, fileNameInDrive, path, folderId)

  return idSpreadsheet
}

async function main() {
  const auth = await authorize();
  console.log("Success on authenticate!")
  const folderId = await createFolder(auth)
  console.log("Creating class folder!")
  const idTemplate = await uploadSpreadsheetStudents(auth, folderId)
  console.log("Success on upload main spread!")
  const students = await getStudents(auth, idTemplate)
  console.log("Loading students with success!")
  await uploadFilesStudents(auth, students, folderId)
  console.log("Upload files each student")
  console.log("Done!")
}

main();

