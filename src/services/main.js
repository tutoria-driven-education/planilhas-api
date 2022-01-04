import { promiseMap } from '../lib/promiseMap';
import { authorize } from './auth';
import { createFolder, copyFile, updatePermitionStudentFile } from './drive';
import { getStudentInfo, initSpreadsheet, writeSheetStudent } from './sheet';
import sendStudentMail from './mail';

async function getStudents(auth, id, amountOfStudents) {
  const amountStudentsRange = parseInt(amountOfStudents, 10) + 11; // initial row students
  let students = {};
  try {
    const ranges = {
      startColumnIndex: 0,
      endColumnIndex: 2,
      startRowIndex: 11,
      endRowIndex: amountStudentsRange,
    };
    const sheetTitle = 'Dashboard';
    const sheet = await initSpreadsheet(auth, id, sheetTitle, ranges);
    students = getStudentInfo(sheet, amountStudentsRange);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error in get Students', err);
  }
  return students;
}

async function uploadFilesStudents(auth, students, folderId, idSpreadsheetTemplate) {
  let fileNameInDrive;
  return promiseMap(students, (student) => {
    fileNameInDrive = `${student.name} - Controle de Presença`;
    return copyFile(auth, idSpreadsheetTemplate, folderId, fileNameInDrive).then(
      (studentId) => updatePermitionStudentFile(auth, studentId, student.name).then(() => {
        // eslint-disable-next-line no-console
        console.log(`Permition ${student.name} changed!`);
        return writeSheetStudent(auth, studentId, student.name, student.email).then(() => {
          // eslint-disable-next-line no-console
          console.log(`Student ${student.name} file rewrited!`);
          return sendStudentMail(student.name, student.email, studentId);
        });
      }),
    );
    // GoogleAPI only accepts 10 queries per second (QPS),
    // therefore, concurrency: 5 is a safe number.
  }, { concurrency: 5 });
}

async function uploadSpreadsheetStudents(auth, folderId, idSpreadsheetStudents) {
  const fileNameInDrive = 'template';
  const idSpreadsheet = await copyFile(auth, idSpreadsheetStudents, folderId, fileNameInDrive);

  return idSpreadsheet;
}

export default async function execute(
  idSpreadsheetStudents,
  idSpreadsheetTemplate,
  amountStudents,
  className,
  token,
) {
  const auth = await authorize(token);
  // eslint-disable-next-line no-console
  console.log('Success on authenticate!');

  const folderId = await createFolder(auth, className);
  // eslint-disable-next-line no-console
  console.log('Creating class folder!');

  const idTemplate = await uploadSpreadsheetStudents(auth, folderId, idSpreadsheetStudents);
  // eslint-disable-next-line no-console
  console.log('Success on copy main spread!');

  const students = await getStudents(auth, idTemplate, amountStudents);
  // eslint-disable-next-line no-console
  console.log('Loading students with success!');

  await uploadFilesStudents(auth, students, folderId, idSpreadsheetTemplate);
  // eslint-disable-next-line no-console
  console.log('Upload files each student');
  // eslint-disable-next-line no-console
  console.log('Done!');
}
