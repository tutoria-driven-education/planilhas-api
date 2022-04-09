import { Credentials } from "google-auth-library";

import { promiseMap } from "../../lib/promiseMap";
import { authorize } from "../google/auth";
import { Drive } from "../google/drive";
import { Sheet } from "../google/sheet";
import sendStudentMail from "../mail";
import { logger } from "../../utils/logger.js";
import { IStudent } from "../google/sheet.d";


async function createNewPage(auth, arrayFilesId, templateSheet, pageName) {
  async function updateStudentsFiles(file) {
    try {
      const page = await initSpreadsheet(auth, file.id, pageName);

      if (page) {
        console.log(`Page ${pageName} already exists. Deleting it...`);
        await page.delete();
      }

      await copyToNewSheet(file, templateSheet);
      console.log(`Copy to file ${file.name} with sucess`);

      await alterSheetNameAndInfo(auth, file, pageName);
      console.log(`Alter to file ${file.name} with sucess`);
    } catch (err) {
      throw new Error(
        `Error in process of file ${file.name} err: ${err?.message}`
      );
    }
  }

  return promiseMap(arrayFilesId, updateStudentsFiles, { concurrency: 5 }); // GoogleAPI only accepts 10 queries per second (QPS), therefore, concurrency: 5 is a safe number.
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
