import { IGetStudentsParams, IStudent, IWriteSpreadSheet } from "./sheet.d";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { templateSpreadsheet } from "../../config";

export class Sheet {
  private sheet;
  constructor(auth: OAuth2Client) {
    this.sheet = google.sheets({ version: "v4", auth });
  }
  async getStudents({
    id,
    amountStudents,
  }: IGetStudentsParams): Promise<IStudent[]> {
    const lastRowStudents =
      amountStudents + templateSpreadsheet.initRowStudents;
    const request = {
      spreadsheetId: id,
      range: `${templateSpreadsheet.sheetTitleStudents}!A${templateSpreadsheet.initRowStudents}:B${lastRowStudents}`,
      dateTimeRenderOption: "FORMATTED_STRING",
      valueRenderOption: "UNFORMATTED_VALUE",
    };

    try {
      const response = (await this.sheet.spreadsheets.values.get(request)).data;
      const studentsInfo = response.values.map((student: Array<string>) => ({
        name: student[0],
        email: student[1],
      }));

      return studentsInfo;
    } catch (error) {
      throw new Error(`Error in get Students :${error?.message}`);
    }
  }

  async writeSheetStudent({
    id,
    studentName,
    studentEmail,
  }: IWriteSpreadSheet) {
    async function updateSheet(range: string, newValue: string) {
      const values = new Array(25).fill(Array(0));
      values[15] = [newValue];
      values[21] = [newValue];
      const request = {
        spreadsheetId: id,
        range,
        valueInputOption: "raw",
        resource: {
          values,
        },
      };
      try {
        const response = (await this.sheet.spreadsheets.values.update(request))
          .data;

        return response;
      } catch (error) {
        throw new Error(
          `Error in write student ${newValue}: ${error?.message}`
        );
      }
    }

    try {
      await updateSheet("Controle!A1:A25", studentName);
      await updateSheet("Controle!B1:B25", studentEmail);
    } catch (error) {
      throw new Error(`Error in write sheet: ${error?.message} `);
    }
  }
}
