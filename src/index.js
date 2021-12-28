import { createReadStream } from "fs";
import { google } from "googleapis";
import { authorize } from "./auth.js";
import { GoogleSpreadsheet } from "google-spreadsheet";

function uploadFile(auth) {
  const drive = google.drive({ version: "v3", auth });
  const fileMetadata = {
    name: "template",
    mimeType: "application/vnd.google-apps.spreadsheet",
  };
  const media = {
    body: createReadStream("template.xlsx"),
    mimeType: "application/vnd.ms-excel",
  };

  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: "id",
    },
    async (_err, res) => {
      await sheet(auth, res.data.id);
    }
  );
}

async function sheet(auth, id) {
  const doc = new GoogleSpreadsheet(id);

  doc.useOAuth2Client(auth);

  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["Dashboard"];

  await sheet.loadCells({
    startColumnIndex: 0,
    endColumnIndex: 2,
    startRowIndex: 11,
    endRowIndex: 125,
  });

  const students = getStudentInfo(sheet, 130);

  const drive = google.drive({ version: "v3", auth });

  for await (const eachStudent of students) {
    createSingleFile(drive, eachStudent);
  }
}

async function createSingleFile(drive, eachStudent) {
  const fileMetadata = {
    name: `${eachStudent.studentName} - Controle de Presença`,
    mimeType: "application/vnd.google-apps.spreadsheet",
  };
  const media = {
    body: createReadStream("templateAluno.xlsx"),
    mimeType: "application/vnd.ms-excel",
  };
  try {
    await drive.files.create(
      {
        resource: fileMetadata,
        media,
        fields: "id",
      },
      (err, res) => {
        if (err) {
          console.log(
            `Falhou com o aluno: ${eachStudent.studentName}, tentando novamente`
          );
          createSingleFile(drive, eachStudent);
        } else {
          console.log(
            `Deu certo com o aluno: ${eachStudent.studentName} && FileId: ${res.data.id}`
          );
        }
      }
    );
  } catch (err) {
    console.log("Request fail, try again")
  }
}

function getStudentInfo(sheet, amountOfStudents) {
  const students = [];
  for (let i = 11; i < amountOfStudents; i++) {
    const studentName = sheet.getCell(i, 0).value;
    const studentEmail = sheet.getCell(i, 1).value;
    if (studentName === null) break;
    students.push({ studentName, studentEmail });
  }
  return students;
}

async function main() {
  const auth = await authorize();
  uploadFile(auth);
}

main();

// let folder = {
//   name: "Turma 5",
//   mimeType: "application/vnd.google-apps.folder",
// };

// let folderId;

// drive.files.create(
//   {
//     resource: folder,
//     fields: "id",
//   },
//   (_err,res) => {
//     folderId = res.data.id;
//   }
// );

// parents: [folderId],
// for await (const eachStudent of students) {
//   const fileMetadata = {
//     name: `${eachStudent.studentName} - Controle de Presença`,
//     mimeType: "application/vnd.google-apps.spreadsheet",
//   };
//   const media = {
//     body: createReadStream("templateAluno.xlsx"),
//     mimeType: "application/vnd.ms-excel",
//   };
//   drive.files.create(
// {
//   resource: fileMetadata,
//   media,
//   fields: "id",
// },
//     (err, _res) => {
//       if (err) {
//         console.log(err);
//       }
//     }
//   );
// }
