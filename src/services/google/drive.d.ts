import { OAuth2Client } from "google-auth-library";

export interface IUploadSpreadsheetParams {
  fileNameInDrive: string;
  path: string;
  folderId: string;
}
export interface ICreateFolderParams {
  folderName: string;
}

export interface ICopySpreadsheetParams {
  id: string;
  folderId: string;
  nameFile: string;
}

export interface IUpdatePermissionFileForAnyoneReaderParams {
  id: string;
}
export interface IGetFilesIdsInsideFolder {
  folderId: string;
}
