import {
  ICreateFolderParams,
  IUploadSpreadsheetParams,
  ICopySpreadsheetParams,
  IUpdatePermissionFileForAnyoneReaderParams,
  IGetFilesIdsInsideFolder,
} from "./drive.d";
import { createReadStream } from "fs";
import { google } from "googleapis";

export async function uploadSpreadsheet({
  auth,
  fileNameInDrive,
  path,
  folderId,
}: IUploadSpreadsheetParams) {
  const drive = google.drive({ version: "v3", auth });

  try {
    const request = await Promise.resolve(
      drive.files.create({
        requestBody: {
          name: fileNameInDrive,
          mimeType: "application/vnd.google-apps.spreadsheet",
          parents: [folderId],
        },
        media: {
          body: createReadStream(path),
          mimeType: "application/vnd.ms-excel",
        },
        fields: "id",
      })
    );

    return request.data.id;
  } catch (error) {
    throw new Error(`Error in upload spreadsheet: ${error?.message} `);
  }
}

export async function createFolder({ auth, folderName }: ICreateFolderParams) {
  const drive = google.drive({ version: "v3", auth });

  try {
    const request = await Promise.resolve(
      drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
      })
    );
    return request.data.id;
  } catch (error) {
    throw new Error(`Error in create folder: ${error?.message} `);
  }
}

export async function copySpreadsheet({
  auth,
  id,
  folderId,
  nameFile,
}: ICopySpreadsheetParams) {
  const drive = google.drive({ version: "v3", auth });

  try {
    const request = await Promise.resolve(
      drive.files.copy({
        fileId: id,
        requestBody: {
          parents: [folderId],
          name: nameFile,
          mimeType: "application/vnd.google-apps.spreadsheet",
        },
      })
    );
    return request.data.id;
  } catch (error) {
    throw new Error(`Error in copy file ${error?.message}`);
  }
}

export async function updatePermissionFileForAnyoneReader({
  auth,
  id,
}: IUpdatePermissionFileForAnyoneReaderParams) {
  const drive = google.drive({ version: "v3", auth });

  try {
    const request = await Promise.resolve(
      drive.permissions.create({
        fileId: id,
        requestBody: {
          type: "anyone",
          role: "reader",
        },
        fields: "id",
      })
    );
    return request.data.id;
  } catch (error) {
    throw new Error(`Error in copy file ${error?.message}`);
  }
}

export async function getFilesIdsInsideFolder({
  auth,
  folderId,
}: IGetFilesIdsInsideFolder) {
  const drive = google.drive({ version: "v3", auth });
  try {
    return await Promise.resolve(
      drive.files.list({
        fields: "files(id, name)",
        q: `'${folderId}' in parents and name contains 'Controle de Presença'`,
      })
    );
  } catch (error) {
    throw new Error(`Error getting all id's inside folder ${error?.message}`);
  }
}
