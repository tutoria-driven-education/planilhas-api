import { Credentials } from "google-auth-library";

import { promiseMap } from "../../lib/promiseMap";
import { authorize } from "../google/auth";
import { Drive } from "../google/drive";
import { Sheet } from "../google/sheet";
import { drive_v3 } from "googleapis";
import { extractStudentNameByFileName } from "../../utils";

interface IUpdateSheet {
  folderId: string;
  idSpreadsheetTemplate: string;
  pageName: string;
  isProtected: boolean;
  token: Credentials;
}
interface ICreateNewPage {
  arrayFilesId: drive_v3.Schema$File[];
  idSpreadsheetTemplate: string;
  pageName: string;
  isProtected: boolean;
  sheetIdInsideTemplate: number;
  sheet: Sheet;
}

interface IAlterSheetNameAndInfo {
  file: drive_v3.Schema$File;
  pageName: string;
  isProtected: boolean;
  sheet: Sheet;
}

export async function updateSheet({
  folderId,
  idSpreadsheetTemplate,
  pageName,
  isProtected,
  token,
}: IUpdateSheet) {
  const auth = await authorize(token);
  const drive = new Drive(auth);
  const sheet = new Sheet(auth);

  const sheetIdInsideTemplate = await sheet.findSheet({
    spreadsheetId: idSpreadsheetTemplate,
    sheetName: pageName,
  });

  if (sheetIdInsideTemplate === null) {
    console.log("Sheet dont exist in template");
    return sheetIdInsideTemplate;
  }
  console.log("Success on getting sheetId!");

  const arrayFilesId = await drive.getFilesIdsInsideFolder({ folderId });
  console.log("Success on getting files id!");

  await createNewPage({
    arrayFilesId,
    idSpreadsheetTemplate,
    sheetIdInsideTemplate,
    isProtected,
    pageName,
    sheet,
  });

  console.log("Done!");
}

async function alterSheetNameAndInfo({
  file,
  pageName,
  isProtected,
  sheet,
}: IAlterSheetNameAndInfo) {
  const actualPageName = `Cópia de ${pageName}`;
  const studentName = extractStudentNameByFileName(file.name);
  const spreadsheetId = file.id;
  try {
    const studentSheetId = await sheet.findSheet({
      spreadsheetId,
      sheetName: actualPageName,
    });
    await sheet.updateValues({
      spreadsheetId,
      sheetName: actualPageName,
      studentName,
    });
    await sheet.updateTitleSheet({
      spreadsheetId,
      sheetId: studentSheetId,
      newTitle: pageName,
      isProtected,
    });
    if (isProtected) {
      await sheet.addProtection({ spreadsheetId, sheetId: studentSheetId });
    }
  } catch (error) {
    throw new Error(`Error in alter sheet name sheet: ${error?.message} `);
  }
}

async function createNewPage({
  arrayFilesId,
  idSpreadsheetTemplate,
  sheetIdInsideTemplate,
  isProtected,
  pageName,
  sheet,
}: ICreateNewPage) {
  async function updateStudentsFiles(file: drive_v3.Schema$File) {
    try {
      const spreadsheetId = file.id;
      const studentSheetId = await sheet.findSheet({
        spreadsheetId,
        sheetName: pageName,
      });
      if (studentSheetId) {
        console.log(
          `Page ${pageName} already exists at ${file.name}. Deleting it...`
        );
        await sheet.deleteSheet({ spreadsheetId, studentSheetId });
      }

      console.log(`Starting copy to file ${file.name}...`);
      await sheet.copySheet({
        destinationSpreadsheetId: file.id,
        spreadsheetId: idSpreadsheetTemplate,
        sheetId: sheetIdInsideTemplate,
      });
      console.log(`Copy to file ${file.name} with success`);

      await alterSheetNameAndInfo({ file, pageName, isProtected, sheet });
      console.log(`Alter to file ${file.name} with success`);
    } catch (err) {
      throw new Error(
        `Error in process of file ${file.name} err: ${err?.message}`
      );
    }
  }

  return promiseMap({
    array: arrayFilesId,
    promiseFn: updateStudentsFiles,
    args: { concurrency: 5 },
  });
}
