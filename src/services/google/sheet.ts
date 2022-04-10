import {
  IGetStudentsParams,
  IStudent,
  IWriteStudentSpreadSheetParams,
  IFindSheetParams,
  IDeleteSheetParams,
  IAddProtectionParams,
  IUpdateTitleSheetParams,
  IUpdateValuesParams,
  ICopySheetParams,
} from "./sheet.d";
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
  }: IWriteStudentSpreadSheetParams) {
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

  async findSheet({
    spreadsheetId,
    sheetName,
  }: IFindSheetParams): Promise<null | number> {
    const request = {
      spreadsheetId,
    };
    try {
      const sheetInsideSpread = (await this.sheet.spreadsheets.get(request))
        .data;
      let sheetTemplateId = null;
      sheetInsideSpread.sheets.forEach((sheet) => {
        if (sheet.properties.title === sheetName) {
          sheetTemplateId = sheet.properties.sheetId;
        }
      });
      return sheetTemplateId;
    } catch (error) {
      throw new Error(`Error in find sheet: ${error?.message} `);
    }
  }

  async deleteSheet({ spreadsheetId, studentSheetId }: IDeleteSheetParams) {
    const sheet = google.sheets("v4");

    const request = {
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteSheet: {
              sheetId: studentSheetId,
            },
          },
        ],
      },
    };

    try {
      await sheet.spreadsheets.batchUpdate(request);
    } catch (error) {
      throw new Error(`Error in delete sheet: ${error?.message} `);
    }
  }

  async updateValues({
    spreadsheetId,
    sheetName,
    studentName,
  }: IUpdateValuesParams) {
    const values = new Array(4).fill(Array(0));
    values[0] = [studentName];

    const requestValues = {
      spreadsheetId,
      range: `${sheetName}!B1:B6`,
      valueInputOption: "raw",
      resource: {
        values,
      },
    };

    try {
      await this.sheet.spreadsheets.values.update(requestValues);
    } catch (error) {
      throw new Error(`Error in update values sheet: ${error?.message} `);
    }
  }

  async updateTitleSheet({
    spreadsheetId,
    sheetId,
    newTitle,
    isProtected,
  }: IUpdateTitleSheetParams) {
    const requestTitle = {
      spreadsheetId,
      resource: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                title: newTitle,
                hidden: isProtected,
              },
              fields: "title, hidden",
            },
          },
        ],
      },
    };

    try {
      await this.sheet.spreadsheets.batchUpdate(requestTitle);
    } catch (error) {
      throw new Error(`Error in update title sheet: ${error?.message} `);
    }
  }

  async addProtection({ spreadsheetId, sheetId }: IAddProtectionParams) {
    const requestProtect = {
      spreadsheetId,
      resource: {
        requests: [
          {
            addProtectedRange: {
              protectedRange: {
                range: {
                  sheetId: sheetId,
                },
              },
            },
          },
        ],
      },
    };
    try {
      await this.sheet.spreadsheets.batchUpdate(requestProtect);
    } catch (error) {
      throw new Error(`Error in add protection sheet: ${error?.message} `);
    }
  }
  
  async copySheet({ destinationSpreadsheetId, spreadsheetId, sheetId }:ICopySheetParams) {
    const request = {
      spreadsheetId,
      sheetId,
      resource: {
        destinationSpreadsheetId,
      },
    };
    try {
      await this.sheet.spreadsheets.sheets.copyTo(request);
    } catch (error) {
      throw new Error(`Error in copy sheet: ${error?.message} `);

    }
  }

  // async getStudentsInfoWithAttendancePercentage(sheet, endpoint) {
  //   const INITIAL_ROW = 11;
  //   const NAME_COLUMN = 0;
  //   const EMAIL_COLUMN = 1;
  //   const PERCENTAGE_COLUMN = 4;
  //   const DAYS_OFF_COLUMN = 5;
  
  //   const students = [];
  
  //   let row = INITIAL_ROW;
  //   let name, email, percentage, daysOff;
  
  //   do {
  //     try {
  //       name = sheet.getCell(row, NAME_COLUMN).value;
  //       email = sheet.getCell(row, EMAIL_COLUMN).value;
  //       percentage = sheet.getCell(row, PERCENTAGE_COLUMN).value;
  //       daysOff = sheet.getCell(row, DAYS_OFF_COLUMN).value;
  
  //       if (name && email && percentage && percentage < 0.9 && daysOff <= 20)
  //         students.push({
  //           name,
  //           email,
  //           percentage: Number((percentage * 100).toFixed(1)),
  //         });
  
  //       row++;
  //     } catch {
  //       throw new Error(`READ_ERROR: Spreadsheet not loaded at row ${row}.`);
  //     }
  //   } while (name !== "Presença Síncrona" && row < endpoint);
  
  //   return students;
  // }
}
