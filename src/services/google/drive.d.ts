import { OAuth2Client } from "google-auth-library";

export interface IUploadSpreadsheetParams {
  auth: OAuth2Client;
  fileNameInDrive: string;
  path: string;
  folderId: string;
}
export interface ICreateFolderParams {
  auth: OAuth2Client;
  folderName: string;
}

export interface ICopySpreadsheetParams {
  auth: OAuth2Client;
  id: string;
  folderId: string;
  nameFile: string;
}

export interface IUpdatePermissionFileForAnyoneReaderParams {
  auth: OAuth2Client;
  id: string;
}
export interface IGetFilesIdsInsideFolder {
  auth: OAuth2Client;
  folderId: string;
}
