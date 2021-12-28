import { createReadStream } from "fs";
import { google } from "googleapis";
import { authorize } from "./auth.js";
import { uploadFile } from "./drive.js";
import {getStudentInfo, initSpreadsheet, writeSheetStudent} from './sheet.js'

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

    const sheet = await initSpreadsheet(auth,id,sheetTitle,ranges)
    const students = getStudentInfo(sheet, amountOfStudents);
    return students
  } catch (err) {
    console.log("Request fail, try again");
  }
}

async function uploadFilesStudents(auth,students,folderId){
  
  const pathTemplateStudent = 'templateAluno.xls'
  let fileNameInDrive;
  for await (const student of students) {
    fileNameInDrive = `${student.name} - Controle de Presença`
    const idStudent = await uploadFile(auth,fileNameInDrive,pathTemplateStudent,folderId)
    await writeSheetStudent(auth,idStudent,student.name,student.email)
    console.log(
      `Student ${student.name} file created!`
    );
  }
}

async function uploadSpreadsheetStudents(auth,folderId){
  const fileNameInDrive = "template"
  const path = "template.xlsx"
  const idSpreadsheet = await uploadFile(auth,fileNameInDrive,path,folderId)

  return idSpreadsheet
}

async function createFolder(auth) {
  const drive = google.drive({ version: "v3", auth });
  let fileMetadata = {
    name: `Turma 5`,
    mimeType: "application/vnd.google-apps.folder",
  };

  try {
    const request = await Promise.resolve(
      drive.files.create({
        resource: fileMetadata,
        fields: "id",
      })
    );
    return request.data.id;
  } catch (err) {
    console.log(err);
  }
}


async function main() {
  const auth = await authorize();
  console.log("Success on authenticate!")
  const folderId = await createFolder(auth)
  console.log("Creating class folder!")
  const idTemplate = await uploadSpreadsheetStudents(auth,folderId)
  console.log("Success on upload main spread!")
  const students = await getStudents(auth,idTemplate)
  console.log("Loading students with success!")
  await uploadFilesStudents(auth,students,folderId)
  console.log("Upload files each student")
  console.log("Done!")

}

main();

