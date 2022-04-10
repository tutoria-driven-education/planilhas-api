import { OAuth2Client } from "google-auth-library";
import {
  ICreateFolderParams,
  IUploadSpreadsheetParams,
  ICopySpreadsheetParams,
  IUpdatePermissionFileForAnyoneReaderParams,
  IGetFilesIdsInsideFolder,
} from "./drive.d";
import { createReadStream } from "fs";
import { google } from "googleapis";

export class Drive {
  private drive;

  constructor(auth: OAuth2Client) {
    this.drive = google.drive({ version: "v3", auth });
  }

  async uploadSpreadsheet({
    fileNameInDrive,
    path,
    folderId,
  }: IUploadSpreadsheetParams) {
    try {
      const request = await Promise.resolve(
        this.drive.files.create({
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

  async createFolder({ folderName }: ICreateFolderParams) {
    try {
      const request = await Promise.resolve(
        this.drive.files.create({
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

  async copySpreadsheet({ spreadsheetId, folderId, nameFile }: ICopySpreadsheetParams) {
    try {
      const request = await Promise.resolve(
        this.drive.files.copy({
          fileId: spreadsheetId,
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

  async updatePermissionFileForAnyoneReader({
    id,
  }: IUpdatePermissionFileForAnyoneReaderParams) {
    try {
      const request = await Promise.resolve(
        this.drive.permissions.create({
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

  async getFilesIdsInsideFolder({ folderId }: IGetFilesIdsInsideFolder) {
    try {
      const filesIds = await Promise.resolve(
        this.drive.files.list({
          fields: "files(id, name)",
          q: `'${folderId}' in parents and name contains 'Controle de Presença'`,
        })
      );
      return  filesIds.data.files
    } catch (error) {
      throw new Error(`Error getting all id's inside folder ${error?.message}`);
    }
  }
}
