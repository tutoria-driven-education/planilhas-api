export interface IGetStudentsParams {
  id: string;
  amountStudents: number;
}
export interface IWriteStudentSpreadSheetParams {
  id: string;
  studentName: string;
  studentEmail: string;
}

export interface IStudent {
  email: string;
  name: string;
}

export interface IFindSheetParams {
  spreadsheetId: string;
  sheetName: string;
}

export interface IDeleteSheetParams {
  spreadsheetId: string;
  studentSheetId: number;
}

export interface IAddProtectionParams {
  spreadsheetId: string;
  sheetId: number;
}

export interface IUpdateTitleSheetParams {
  spreadsheetId: string;
  sheetId: number;
  newTitle: string;
  isProtected: boolean;
}

export interface IUpdateValuesParams {
  spreadsheetId: string;
  sheetName: string;
  studentName: string;
}

export interface ICopySheetParams {
  destinationSpreadsheetId: string;
  spreadsheetId: string;
  sheetId: number;
}
