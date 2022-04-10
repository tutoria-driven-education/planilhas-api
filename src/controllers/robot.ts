import { Request, Response } from "express";
import * as createSpreadsheetService from "../services/robot/createSheetsStudents";
import * as updateSpreadsheetService from "../services/robot/updateSheetStudents";
import { extractIdByUrl } from "../utils/index";

export async function generateSpreadsheets(req: Request, res: Response) {
  const {
    linkSpreadsheetStudents,
    linkSpreadsheetTemplate,
    amountStudents,
    className,
    token,
  } = req.body;

  const idSpreadsheetStudents = extractIdByUrl(linkSpreadsheetStudents);
  const idSpreadsheetTemplate = extractIdByUrl(linkSpreadsheetTemplate);

  await createSpreadsheetService.createSheetStudents({
    idSpreadsheetStudents,
    idSpreadsheetTemplate,
    amountStudents: parseInt(amountStudents),
    folderName: className,
    token,
  });

  return res.sendStatus(200);
}

export async function updateSheet(req: Request, res: Response) {
  const {
    folderLinkSpreadsheet,
    linkSpreadsheetTemplate,
    spreadsheetPageName,
    isProtected,
    token,
  } = req.body;

  const folderId = extractIdByUrl(folderLinkSpreadsheet);
  const idSpreadsheetTemplate = extractIdByUrl(linkSpreadsheetTemplate);

  const result = await updateSpreadsheetService.updateSheet({
    folderId,
    idSpreadsheetTemplate,
    pageName: spreadsheetPageName,
    isProtected,
    token,
  });

  if (result === null) {
    return res.sendStatus(400);
  }

  return res.sendStatus(200);
}
/*
export async function getStudentsUnderNinetyPercent(
  req: Request,
  res: Response
) {
  const { linkSpreadsheetStudents, token, endpoint } = req.body;

  try {
    const studentsInfo = await mainService.getStudentsUnderNinetyPercent(
      extractIdByUrl(linkSpreadsheetStudents),
      token,
      endpoint
    );
    res.send(studentsInfo);
  } catch (error) {
    console.error(error);

    if (error.message.includes("READ_ERROR"))
      return res.status(404).send(error.message);

    res.sendStatus(500);
  }
}
*/
