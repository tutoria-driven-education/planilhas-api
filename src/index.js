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
      endRowIndex: 25,
    }
    const sheetTitle = "Dashboard"
    const amountOfStudents = 22

    const sheet = await initSpreadsheet(auth,id,sheetTitle,ranges)
    const students = getStudentInfo(sheet, amountOfStudents);
    return students
  } catch (err) {
    console.log("Request fail, try again");
  }
}

async function uploadFilesStudents(auth,students){
  
  const pathTemplateStudent = 'templateAluno.xls'
  let fileNameInDrive;
  for await (const student of students) {
    fileNameInDrive = `${student.name} - Controle de Presença`
    const idStudent = await uploadFile(auth,fileNameInDrive,pathTemplateStudent)
    await writeSheetStudent(auth,idStudent,student.name,student.email)
    console.log(
      `Deu certo com o aluno: ${student.name} && FileId: ${idStudent}`
    );
  }
}

async function uploadSpreadsheetStudents(auth){
  const fileNameInDrive = "template"
  const path = "template.xlsx"
  const idSpreadsheet = await uploadFile(auth,fileNameInDrive,path)

  return idSpreadsheet
}


async function main() {
  const auth = await authorize();
  console.log("Autenticado com sucesso!")
  const idTemplate = await uploadSpreadsheetStudents(auth)
  console.log("Upload da mae com sucesso!")
  const students = await getStudents(auth,idTemplate)
  console.log("Loading students with success!")
  await uploadFilesStudents(auth,students)
  console.log("Upload files each student")

}

main();

